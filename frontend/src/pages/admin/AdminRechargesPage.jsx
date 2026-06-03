import { useEffect, useState } from 'react';
import { api, uploadUrl } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

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

  const review = async (id, status) => {
    await api.patch(`/admin/recharges/${id}`, {
      status,
      adminRemarks: remarks[id] || '',
    });
    load();
  };

  return (
    <div className="page">
      <h1>Credit approvals</h1>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Screenshot</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>
                  {r.user?.name}
                  <br />
                  <small>{r.user?.email}</small>
                </td>
                <td>{formatMoney(r.amount)}</td>
                <td>
                  <a href={uploadUrl(r.screenshotUrl)} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
                <td>
                  <span className={`badge ${r.status}`}>{r.status}</span>
                </td>
                <td>
                  <input
                    placeholder="Admin remarks"
                    value={remarks[r._id] || ''}
                    onChange={(e) => setRemarks({ ...remarks, [r._id]: e.target.value })}
                    disabled={r.status !== 'pending'}
                  />
                </td>
                <td className="actions">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
