import { useEffect, useMemo, useState } from 'react';
import { api, uploadUrl } from '../../api/client';
import {
  AdminCellActions,
  AdminCellDate,
  AdminCellInput,
  AdminCellMoney,
  AdminCellUser,
  AdminDataTable,
  AdminMetaStrip,
  AdminPageHeader,
  AdminStatusFilters,
  AdminTableRow,
  AdminToolbar,
} from '../../components/AdminDataUI';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

const FILTER_OPTIONS = ['', 'pending', 'approved', 'rejected'];

export default function AdminRechargesPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [remarks, setRemarks] = useState({});

  const load = () =>
    api.get('/admin/recharges', { params: { status: filter || undefined } }).then((res) => {
      setRequests(res.data.requests);
    });

  useEffect(() => {
    load();
  }, [filter]);

  const counts = useMemo(() => {
    const c = { '': requests.length };
    for (const r of requests) {
      c[r.status] = (c[r.status] || 0) + 1;
    }
    return c;
  }, [requests]);

  const review = async (id, status) => {
    await api.patch(`/admin/recharges/${id}`, {
      status,
      adminRemarks: remarks[id] || '',
    });
    load();
  };

  const columns = [
    { key: 'date', label: 'Submitted' },
    { key: 'user', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'desc', label: 'Payment note' },
    { key: 'screenshot', label: 'Screenshot' },
    { key: 'status', label: 'Status' },
    { key: 'remarks', label: 'Admin remarks' },
    { key: 'actions', label: 'Actions', className: 'admin-col-actions' },
  ];

  return (
    <div className="page">
      <AdminPageHeader
        title="Credit approvals"
        subtitle="Verify payment screenshots and notes from users before approving recharges to their balance."
      />
      <AdminToolbar>
        <AdminStatusFilters
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
          counts={filter === '' ? counts : undefined}
        />
      </AdminToolbar>
      <AdminMetaStrip
        items={[
          { label: 'Showing', value: requests.length },
          { label: 'Filter', value: filter || 'all' },
        ]}
      />
      <AdminDataTable
        columns={columns}
        empty={
          requests.length === 0
            ? filter === 'pending'
              ? 'No pending recharges awaiting approval.'
              : 'No recharges match this filter.'
            : null
        }
        colSpan={columns.length}
      >
        {requests.map((r) => (
          <AdminTableRow key={r._id}>
            <AdminCellDate date={r.createdAt} />
            <AdminCellUser name={r.user?.name} email={r.user?.email} />
            <AdminCellMoney amount={r.amount} formatMoney={formatMoney} />
            <td className={`admin-desc-cell${r.paymentDescription ? '' : ' empty'}`}>
              {r.paymentDescription || '—'}
            </td>
            <td>
              <a className="admin-link" href={uploadUrl(r.screenshotUrl)} target="_blank" rel="noreferrer">
                View screenshot
              </a>
            </td>
            <td>
              <span className={`badge ${r.status}`}>{r.status}</span>
            </td>
            <AdminCellInput
              value={remarks[r._id] || ''}
              onChange={(e) => setRemarks({ ...remarks, [r._id]: e.target.value })}
              disabled={r.status !== 'pending'}
            />
            <AdminCellActions>
              {r.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn small primary"
                    onClick={() => review(r._id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn small danger"
                    onClick={() => review(r._id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
            </AdminCellActions>
          </AdminTableRow>
        ))}
      </AdminDataTable>
    </div>
  );
}
