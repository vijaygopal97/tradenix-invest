import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet, Inbox, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';
import { Panel, SectionTitle, StatCard, Badge } from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recharges, setRecharges] = useState([]);
  const [rate, setRate] = useState(null);

  useEffect(() => {
    const load = () => {
      api.get('/admin/dashboard').then((res) => setStats(res.data));
      api.get('/admin/recharges', { params: { status: 'pending' } }).then((res) => {
        setRecharges(res.data.requests.slice(0, 4));
      });
      api.get('/admin/interest').then((res) => {
        setRate(res.data.logs?.[0]?.dailyPercent);
      });
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <SectionTitle
        eyebrow="Overview"
        title="Mission control"
        subtitle="Live snapshot of platform health, capital, and pending approvals."
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active users"
          value={stats?.totalUsers ?? '—'}
          hint="Registered investors"
          accent="primary"
          icon={Users}
        />
        <StatCard
          delay={0.05}
          label="Capital under platform"
          value={stats ? formatMoney(stats.totalCredits) : '—'}
          hint="Real-time sum"
          accent="gold"
          icon={Wallet}
        />
        <StatCard
          delay={0.1}
          label="Pending recharges"
          value={stats?.pendingRecharges ?? '—'}
          hint="Awaiting review"
          accent={stats?.pendingRecharges > 0 ? 'danger' : 'primary'}
          icon={Inbox}
        />
        <StatCard
          delay={0.15}
          label="Pending withdrawals"
          value={stats?.pendingWithdrawals ?? '—'}
          hint="Awaiting payout"
          accent={stats?.pendingWithdrawals > 0 ? 'danger' : 'primary'}
          icon={ArrowUpRight}
        />
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl">Latest pending recharges</h3>
          <Link to="/admin/recharges" className="text-xs text-primary hover:underline">
            Open queue →
          </Link>
        </div>
        <div className="space-y-2">
          {!recharges.length && (
            <p className="text-sm text-muted-foreground">All caught up.</p>
          )}
          {recharges.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/[0.06] grid place-items-center text-sm font-semibold">
                  {r.user?.name?.[0] ?? '?'}
                </div>
                <div>
                  <div className="text-sm">{r.user?.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono">{formatMoney(r.amount)}</div>
                <Badge status={r.status} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-xs text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          Current daily rate:{' '}
          <span className="text-primary font-mono">
            {rate != null ? `${Number(rate).toFixed(2)}%` : '—'}
          </span>
        </div>
      </Panel>
    </>
  );
}
