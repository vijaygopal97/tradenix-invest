import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AdminInterestPage() {
  const [logs, setLogs] = useState([]);
  const [dailyPercent, setDailyPercent] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const load = () => api.get('/admin/interest').then((res) => setLogs(res.data.logs));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    await api.post('/admin/interest', { dailyPercent: Number(dailyPercent), note });
    setDailyPercent('');
    setNote('');
    setMessage('Interest rate updated (applies from now).');
    load();
  };

  return (
    <div className="page">
      <h1>Interest management</h1>
      <p className="lead">Changes apply prospectively. Past accrual is settled before each update.</p>
      {message && <p className="success">{message}</p>}
      <form onSubmit={onSubmit} className="form panel narrow">
        <label>
          Daily interest (%)
          <input
            type="number"
            min="0"
            step="0.01"
            value={dailyPercent}
            onChange={(e) => setDailyPercent(e.target.value)}
            required
          />
        </label>
        <label>
          Note (optional)
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="submit" className="btn primary">
          Update rate
        </button>
      </form>
      <section className="panel">
        <h2>Change history</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Effective from</th>
                <th>Rate (%)</th>
                <th>Changed by</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.effectiveFrom).toLocaleString()}</td>
                  <td>{l.dailyPercent}</td>
                  <td>{l.changedBy?.name || '—'}</td>
                  <td>{l.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
