import { useEffect, useState } from 'react';
import { api } from '../../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

export default function UserDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data: res } = await api.get('/user/dashboard');
      setData(res);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <h1>Credit dashboard</h1>
      <p className="lead">Balance grows continuously from your configured daily interest rate.</p>
      {error && <p className="error">{error}</p>}
      <div className="stat-grid">
        <article className="stat-card highlight">
          <span>Current balance</span>
          <strong>{formatMoney(data?.balance)}</strong>
          <small>Updates every 5 seconds</small>
        </article>
        <article className="stat-card">
          <span>Daily interest</span>
          <strong>{data?.dailyInterestPercent ?? '—'}%</strong>
          <small>Applied prospectively by admin</small>
        </article>
        <article className="stat-card">
          <span>Last accrual sync</span>
          <strong className="small">
            {data?.lastAccrualAt ? new Date(data.lastAccrualAt).toLocaleString() : '—'}
          </strong>
        </article>
      </div>
    </div>
  );
}
