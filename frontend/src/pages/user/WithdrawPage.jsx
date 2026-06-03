import { useEffect, useState } from 'react';
import { api, uploadUrl } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

const emptyBank = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscOrSwift: '',
};

export default function WithdrawPage() {
  const [accounts, setAccounts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [bankAccountId, setBankAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [accRes, wRes] = await Promise.all([
      api.get('/user/bank-accounts'),
      api.get('/user/withdrawals'),
    ]);
    setAccounts(accRes.data.accounts);
    setWithdrawals(wRes.data.withdrawals);
    if (accRes.data.accounts.length && !bankAccountId) {
      setBankAccountId(accRes.data.accounts[0]._id);
    }
  };

  useEffect(() => {
    load().catch(() => setError('Failed to load withdraw page'));
  }, []);

  const saveBank = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/user/bank-accounts', bankForm);
      setBankForm(emptyBank);
      setMessage('Bank account saved.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save bank account');
    }
  };

  const submitWithdrawal = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/user/withdrawals', { bankAccountId, amount: Number(amount) });
      setAmount('');
      setMessage('Withdrawal request submitted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="page">
      <h1>Withdraw</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="grid two">
        <section className="panel">
          <h2>Add bank account</h2>
          <form onSubmit={saveBank} className="form">
            {Object.keys(emptyBank).map((key) => (
              <label key={key}>
                {key.replace(/([A-Z])/g, ' $1')}
                <input
                  value={bankForm[key]}
                  onChange={(e) => setBankForm({ ...bankForm, [key]: e.target.value })}
                  required
                />
              </label>
            ))}
            <button type="submit" className="btn primary">
              Save account
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>Request withdrawal</h2>
          <form onSubmit={submitWithdrawal} className="form">
            <label>
              Saved account
              <select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                required
              >
                <option value="">Select…</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.bankName} — {a.accountNumber.slice(-4).padStart(a.accountNumber.length, '*')}
                  </option>
                ))}
              </select>
            </label>
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
            <button type="submit" className="btn primary" disabled={!accounts.length}>
              Submit request
            </button>
          </form>
        </section>
      </div>
      <section className="panel">
        <h2>Withdrawal history</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Bank</th>
                <th>Status</th>
                <th>Admin remarks</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id}>
                  <td>{new Date(w.createdAt).toLocaleString()}</td>
                  <td>{formatMoney(w.amount)}</td>
                  <td>{w.bankAccount?.bankName}</td>
                  <td>
                    <span className={`badge ${w.status}`}>{w.status}</span>
                  </td>
                  <td>{w.adminRemarks || '—'}</td>
                  <td>
                    {w.paymentProofUrl ? (
                      <a href={uploadUrl(w.paymentProofUrl)} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {!withdrawals.length && (
                <tr>
                  <td colSpan={6} className="muted">
                    No withdrawals yet.
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
