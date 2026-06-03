import { useEffect, useState } from 'react';
import { api, uploadUrl } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

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

  return (
    <div className="page">
      <h1>Withdrawal management</h1>
      {error && <p className="error">{error}</p>}
      <p className="muted">
        To mark a withdrawal as paid, upload proof of the bank transfer (image), then click Mark paid.
      </p>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Status</th>
              <th>Proof upload</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w._id}>
                <td>
                  {w.user?.name}
                  <br />
                  <small>{w.user?.email}</small>
                </td>
                <td>{formatMoney(w.amount)}</td>
                <td>
                  {w.bankAccount?.bankName}
                  <br />
                  <small>{w.bankAccount?.accountNumber}</small>
                </td>
                <td>
                  <span className={`badge ${w.status}`}>{w.status}</span>
                </td>
                <td>
                  {w.paymentProofUrl ? (
                    <a href={uploadUrl(w.paymentProofUrl)} target="_blank" rel="noreferrer">
                      View proof
                    </a>
                  ) : w.status === 'pending' ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProofFiles({ ...proofFiles, [w._id]: e.target.files?.[0] })
                      }
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <input
                    value={remarks[w._id] || ''}
                    onChange={(e) => setRemarks({ ...remarks, [w._id]: e.target.value })}
                    disabled={w.status !== 'pending'}
                  />
                </td>
                <td className="actions">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
