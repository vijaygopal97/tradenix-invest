import { useEffect, useState } from 'react';
import { api } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data));
    const id = setInterval(() => {
      api.get('/admin/dashboard').then((res) => setStats(res.data));
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <h1>Admin overview</h1>
      <div className="stat-grid">
        <article className="stat-card">
          <span>Total users</span>
          <strong>{stats?.totalUsers ?? '—'}</strong>
        </article>
        <article className="stat-card highlight">
          <span>Total credits in system</span>
          <strong>{stats ? formatMoney(stats.totalCredits) : '—'}</strong>
        </article>
        <article className="stat-card warn">
          <span>Pending recharges</span>
          <strong>{stats?.pendingRecharges ?? '—'}</strong>
        </article>
        <article className="stat-card warn">
          <span>Pending withdrawals</span>
          <strong>{stats?.pendingWithdrawals ?? '—'}</strong>
        </article>
      </div>
    </div>
  );
}
