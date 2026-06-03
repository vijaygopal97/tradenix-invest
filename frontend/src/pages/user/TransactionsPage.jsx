import { useEffect, useState } from 'react';
import { api } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get('/user/transactions').then((res) => setTransactions(res.data.transactions));
  }, []);

  return (
    <div className="page">
      <h1>Transaction history</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance after</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>{t.type.replace(/_/g, ' ')}</td>
                <td className={t.amount >= 0 ? 'pos' : 'neg'}>{formatMoney(t.amount)}</td>
                <td>{formatMoney(t.balanceAfter)}</td>
                <td>{t.note || '—'}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td colSpan={5} className="muted">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
