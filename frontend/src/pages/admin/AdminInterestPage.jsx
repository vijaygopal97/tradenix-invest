import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  AdminCellDate,
  AdminCellUser,
  AdminDataTable,
  AdminPageHeader,
  AdminTableRow,
} from '../../components/AdminDataUI';

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

  const currentRate = logs[0]?.dailyPercent;

  const columns = [
    { key: 'effective', label: 'Effective from' },
    { key: 'rate', label: 'Daily rate (%)' },
    { key: 'by', label: 'Changed by' },
    { key: 'note', label: 'Note' },
  ];

  return (
    <div className="page">
      <AdminPageHeader
        title="Interest management"
        subtitle="Changes apply prospectively. Past accrual is settled before each rate update."
      />
      {message && <p className="success">{message}</p>}
      <section className="panel admin-form-card">
        <h2>Set new daily rate</h2>
        {currentRate != null && (
          <p className="muted">
            Current rate: <strong>{currentRate}%</strong> per day
          </p>
        )}
        <form onSubmit={onSubmit} className="form narrow">
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
      </section>
      <section className="panel" style={{ marginTop: '1.25rem', padding: 0, border: 'none', background: 'transparent' }}>
        <h2 style={{ margin: '0 0 0.75rem' }}>Change history</h2>
        <AdminDataTable
          columns={columns}
          empty={logs.length === 0 ? 'No interest rate changes recorded yet.' : null}
          colSpan={columns.length}
        >
          {logs.map((l) => (
            <AdminTableRow key={l._id}>
              <AdminCellDate date={l.effectiveFrom} />
              <td className="admin-cell-money">{l.dailyPercent}%</td>
              <AdminCellUser name={l.changedBy?.name} email={l.changedBy?.email} />
              <td className={`admin-desc-cell${l.note ? '' : ' empty'}`}>{l.note || '—'}</td>
            </AdminTableRow>
          ))}
        </AdminDataTable>
      </section>
    </div>
  );
}
