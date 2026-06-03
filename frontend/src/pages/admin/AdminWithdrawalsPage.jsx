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

const FILTER_OPTIONS = ['', 'pending', 'paid', 'rejected'];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [remarks, setRemarks] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    api.get('/admin/withdrawals', { params: { status: filter || undefined } }).then((res) => {
      setWithdrawals(res.data.withdrawals);
    });

  useEffect(() => {
    load();
  }, [filter]);

  const counts = useMemo(() => {
    const c = { '': withdrawals.length };
    for (const w of withdrawals) {
      c[w.status] = (c[w.status] || 0) + 1;
    }
    return c;
  }, [withdrawals]);

  const process = async (id, status) => {
    setError('');
    if (status === 'paid' && !proofFiles[id]) {
      setError('Upload a payment proof image (JPEG, PNG, WebP, or GIF) before marking as paid.');
      return;
    }
    setBusyId(id);
    try {
      const form = new FormData();
      form.append('status', status);
      form.append('adminRemarks', remarks[id] || '');
      if (proofFiles[id]) form.append('paymentProof', proofFiles[id]);
      await api.patch(`/admin/withdrawals/${id}`, form);
      setProofFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update withdrawal. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'date', label: 'Requested' },
    { key: 'user', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'bank', label: 'Bank account' },
    { key: 'status', label: 'Status' },
    { key: 'proof', label: 'Payment proof' },
    { key: 'remarks', label: 'Admin remarks' },
    { key: 'actions', label: 'Actions', className: 'admin-col-actions' },
  ];

  return (
    <div className="page">
      <AdminPageHeader
        title="Withdrawal management"
        subtitle="Review payout requests, upload transfer proof when marking paid, or reject to refund the user's balance."
      />
      {error && <p className="error">{error}</p>}
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
          { label: 'Showing', value: withdrawals.length },
          { label: 'Filter', value: filter || 'all' },
        ]}
      />
      <AdminDataTable
        columns={columns}
        empty={
          withdrawals.length === 0
            ? filter === 'pending'
              ? 'No pending withdrawals — you are all caught up.'
              : 'No withdrawals match this filter.'
            : null
        }
        colSpan={columns.length}
      >
        {withdrawals.map((w) => (
          <AdminTableRow key={w._id}>
            <AdminCellDate date={w.createdAt} />
            <AdminCellUser name={w.user?.name} email={w.user?.email} />
            <AdminCellMoney amount={w.amount} formatMoney={formatMoney} />
            <td>
              <span className="admin-user-name">{w.bankAccount?.bankName || '—'}</span>
              <span className="admin-user-email">{w.bankAccount?.accountNumber}</span>
              {w.bankAccount?.proofUrl && (
                <>
                  <br />
                  <a
                    className="admin-link"
                    href={uploadUrl(w.bankAccount.proofUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Bank proof
                  </a>
                </>
              )}
            </td>
            <td>
              <span className={`badge ${w.status}`}>{w.status}</span>
            </td>
            <td>
              {w.paymentProofUrl ? (
                <a className="admin-link" href={uploadUrl(w.paymentProofUrl)} target="_blank" rel="noreferrer">
                  View proof
                </a>
              ) : w.status === 'pending' ? (
                <input
                  className="admin-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProofFiles({ ...proofFiles, [w._id]: e.target.files?.[0] })
                  }
                />
              ) : (
                <span className="muted">—</span>
              )}
            </td>
            <AdminCellInput
              value={remarks[w._id] || ''}
              onChange={(e) => setRemarks({ ...remarks, [w._id]: e.target.value })}
              disabled={w.status !== 'pending'}
            />
            <AdminCellActions>
              {w.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn small primary"
                    disabled={busyId === w._id}
                    onClick={() => process(w._id, 'paid')}
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    className="btn small danger"
                    disabled={busyId === w._id}
                    onClick={() => process(w._id, 'rejected')}
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
