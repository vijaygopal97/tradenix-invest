import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/users/${id}`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <div className="page">Loading…</div>;
  const { user, recharges, withdrawals, transactions } = data;

  return (
    <div className="page">
      <Link to="/admin/users" className="back-link">
        ← Users
      </Link>
      <h1>{user.name}</h1>
      <p className="muted">{user.email}</p>
      <p>
        Balance: <strong>{formatMoney(user.balance)}</strong>
      </p>
      <section className="panel">
        <h2>Recharges</h2>
        <MiniTable
          rows={recharges}
          cols={[
            (r) => new Date(r.createdAt).toLocaleString(),
            (r) => formatMoney(r.amount),
            (r) => r.status,
          ]}
        />
      </section>
      <section className="panel">
        <h2>Withdrawals</h2>
        <MiniTable
          rows={withdrawals}
          cols={[
            (r) => new Date(r.createdAt).toLocaleString(),
            (r) => formatMoney(r.amount),
            (r) => r.status,
          ]}
        />
      </section>
      <section className="panel">
        <h2>Transactions</h2>
        <MiniTable
          rows={transactions}
          cols={[
            (r) => new Date(r.createdAt).toLocaleString(),
            (r) => r.type,
            (r) => formatMoney(r.amount),
          ]}
        />
      </section>
    </div>
  );
}

function MiniTable({ rows, cols }) {
  if (!rows?.length) return <p className="muted">None</p>;
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              {cols.map((c, i) => (
                <td key={i}>{c(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
