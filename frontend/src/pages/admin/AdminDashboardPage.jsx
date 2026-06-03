import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet, Inbox, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';
import { Panel, SectionTitle, StatCard, Badge } from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

function Bars() {
  const data = [42, 58, 36, 71, 64, 88, 52, 76, 92, 68, 84, 96, 79, 110];
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-md hover:from-primary/60 transition"
            style={{ height: `${(d / max) * 100}%` }}
          />
          <div className="text-[9px] text-muted-foreground">{i + 1}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recharges, setRecharges] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [rate, setRate] = useState(null);

  useEffect(() => {
    const load = () => {
      api.get('/admin/dashboard').then((res) => setStats(res.data));
      api.get('/admin/recharges', { params: { status: 'pending' } }).then((res) => {
        setRecharges(res.data.requests.slice(0, 4));
      });
      api.get('/admin/users').then((res) => {
        const sorted = [...(res.data.users ?? [])].sort((a, b) => b.balance - a.balance);
        setTopUsers(sorted.slice(0, 5));
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
          hint="Including admins"
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

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-xl">Capital flow</h3>
              <p className="text-xs text-muted-foreground mt-1">Net deposits last 14 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> +18.6%
            </div>
          </div>
          <Bars />
        </Panel>

        <Panel>
          <h3 className="font-display text-xl mb-4">Top investors</h3>
          <div className="space-y-3">
            {!topUsers.length && (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            )}
            {topUsers.map((u, i) => (
              <Link
                key={u._id}
                to={`/admin/users/${u._id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-black/[0.03] transition"
              >
                <div className="text-xs text-muted-foreground w-5">{i + 1}</div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 grid place-items-center text-xs font-semibold">
                  {u.name?.[0] ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{u.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                </div>
                <div className="text-sm font-mono">{formatMoney(u.balance)}</div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl">Latest pending approvals</h3>
          <Link to="/admin/recharges" className="text-xs text-primary hover:underline">
            Open queue →
          </Link>
        </div>
        <div className="space-y-2">
          {!recharges.length && (
            <p className="text-sm text-muted-foreground">All caught up. 🎉</p>
          )}
          {recharges.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-black/[0.025] transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-black/[0.04] grid place-items-center text-sm font-semibold">
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
        <div className="mt-5 text-xs text-muted-foreground">
          Current daily rate:{' '}
          <span className="text-primary font-mono">
            {rate != null ? `${Number(rate).toFixed(2)}%` : '—'}
          </span>
        </div>
      </Panel>
    </>
  );
}
