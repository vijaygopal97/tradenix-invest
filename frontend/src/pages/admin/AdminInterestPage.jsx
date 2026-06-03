import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { api } from '../../api/client';
import {
  Panel,
  SectionTitle,
  Field,
  Input,
  Button,
  Alert,
  TableWrap,
  Th,
  Td,
} from '../../components/ui-bits';
import { formatDate } from '../../lib/format';

export default function AdminInterestPage() {
  const [logs, setLogs] = useState([]);
  const [dailyPercent, setDailyPercent] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const load = () => api.get('/admin/interest').then((res) => setLogs(res.data.logs));

  useEffect(() => {
    load();
  }, []);

  const current = logs[0]?.dailyPercent;

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
    <>
      <SectionTitle
        eyebrow="Interest"
        title="Rate management"
        subtitle="Changes apply from the moment you save. Past accrual is preserved."
      />

      <div className="grid lg:grid-cols-[1.2fr_2fr] gap-5">
        <Panel className="relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Current daily rate
            </div>
            <div className="font-display text-6xl mt-2 text-gradient">
              {current != null ? `${Number(current).toFixed(2)}%` : '—'}
            </div>
            <div className="inline-flex items-center gap-1 mt-2 text-xs text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Compounded continuously
            </div>
          </div>
          {message && (
            <div className="mt-5">
              <Alert tone="success">{message}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Field label="New daily rate (%)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={dailyPercent}
                onChange={(e) => setDailyPercent(e.target.value)}
                required
              />
            </Field>
            <Field label="Note (optional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Button type="submit" full>
              Update rate
            </Button>
          </form>
        </Panel>

        <Panel className="p-0 overflow-hidden">
          <div className="p-6">
            <h3 className="font-display text-xl">Change history</h3>
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Effective from</Th>
                <Th>Daily %</Th>
                <Th>Changed by</Th>
                <Th>Note</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <Td className="text-muted-foreground">{formatDate(l.effectiveFrom)}</Td>
                  <Td className="font-mono text-primary">{l.dailyPercent}%</Td>
                  <Td>{l.changedBy?.name || '—'}</Td>
                  <Td className="text-muted-foreground">{l.note || '—'}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      </div>
    </>
  );
}
