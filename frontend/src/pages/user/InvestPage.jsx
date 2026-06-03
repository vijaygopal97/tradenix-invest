import { useEffect, useState } from 'react';
import { api, uploadUrl } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

export default function InvestPage() {
  const [bank, setBank] = useState(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [bankRes, reqRes] = await Promise.all([
      api.get('/user/platform-bank'),
      api.get('/user/recharges'),
    ]);
    setBank(bankRes.data.bank);
    setRequests(reqRes.data.requests);
  };

  useEffect(() => {
    load().catch(() => setError('Failed to load invest page'));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!file) {
      setError('Please upload a payment screenshot');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('amount', amount);
      form.append('screenshot', file);
      await api.post('/user/recharges', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAmount('');
      setFile(null);
      e.target.reset();
      setMessage('Recharge submitted for admin approval.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Invest (recharge)</h1>
      <div className="grid two">
        <section className="panel">
          <h2>Platform bank details</h2>
          {!bank ? (
            <p className="muted">Bank details not configured yet. Contact support.</p>
          ) : (
            <dl className="detail-list">
              <div>
                <dt>Account holder</dt>
                <dd>{bank.accountHolderName}</dd>
              </div>
              <div>
                <dt>Bank</dt>
                <dd>{bank.bankName}</dd>
              </div>
              <div>
                <dt>Account number</dt>
                <dd>{bank.accountNumber}</dd>
              </div>
              <div>
                <dt>IFSC / SWIFT</dt>
                <dd>{bank.ifscOrSwift}</dd>
              </div>
              {bank.branch && (
                <div>
                  <dt>Branch</dt>
                  <dd>{bank.branch}</dd>
                </div>
              )}
              {bank.instructions && (
                <div>
                  <dt>Instructions</dt>
                  <dd>{bank.instructions}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
        <section className="panel">
          <h2>Submit recharge</h2>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={onSubmit} className="form">
            <label>
              Amount
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label>
              Payment screenshot
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </button>
          </form>
        </section>
      </div>
      <section className="panel">
        <h2>Recharge history</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{formatMoney(r.amount)}</td>
                  <td>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                  <td>{r.adminRemarks || '—'}</td>
                  <td>
                    <a href={uploadUrl(r.screenshotUrl)} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan={5} className="muted">
                    No recharge requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
