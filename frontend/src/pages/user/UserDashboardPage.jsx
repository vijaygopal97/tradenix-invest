import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Percent, Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Panel, SectionTitle, StatCard, Badge } from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

function Row({ label, value, pos }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={pos ? 'text-primary font-mono' : 'font-medium'}>{value}</span>
    </div>
  );
}

function BalanceChart() {
  const pts = [42, 48, 46, 55, 60, 58, 68, 72, 70, 78, 84, 82, 92, 96, 98, 110, 115, 124, 130, 142];
  const max = Math.max(...pts);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 100} ${100 - (p / max) * 90}`)
    .join(' ');
  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-44">
        <defs>
          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.14 158)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.62 0.14 158)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L 100 100 L 0 100 Z`} fill="url(#dg)" />
        <path
          d={d}
          stroke="oklch(0.62 0.14 158)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
        <span>20 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const [dash, tx] = await Promise.all([
      api.get('/user/dashboard'),
      api.get('/user/transactions'),
    ]);
    setData(dash.data);
    setTransactions(tx.data.transactions);
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const recent = transactions.slice(0, 5);
  const rate = data?.dailyInterestPercent ?? 0;
  const dailyEarn = ((data?.balance ?? 0) * rate) / 100;

  const snapshot = useMemo(() => {
    let deposited = 0;
    let interest = 0;
    let withdrawals = 0;
    for (const t of transactions) {
      if (t.type === 'recharge_approved') deposited += t.amount;
      else if (t.type === 'interest_accrual') interest += t.amount;
      else if (t.type === 'withdrawal_paid' || t.type === 'withdrawal_reserved')
        withdrawals += Math.abs(t.amount);
    }
    return { deposited, interest, withdrawals };
  }, [transactions]);

  return (
    <>
      <SectionTitle
        eyebrow="Dashboard"
        title={`Good day, ${user?.name?.split(' ')[0] ?? 'Investor'}`}
        subtitle="Your capital is compounding in real time. Updates stream every 5 seconds."
      />
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <Panel className="relative overflow-hidden mb-6">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live balance
            </div>
            <motion.div
              key={Math.floor((data?.balance ?? 0) * 100)}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-display text-6xl lg:text-7xl mt-3 text-gradient tabular-nums"
            >
              {formatMoney(data?.balance)}
            </motion.div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>+{formatMoney(dailyEarn)}</span>
              <span className="text-xs text-muted-foreground">est. today</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/invest"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shine-on-hover"
              >
                <ArrowDownLeft className="h-4 w-4" /> Add funds
              </Link>
              <Link
                to="/withdraw"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 hover:bg-black/[0.04] text-sm"
              >
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </Link>
            </div>
          </div>
          <BalanceChart />
        </div>
      </Panel>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard
          delay={0.05}
          label="Daily interest"
          value={`${Number(rate).toFixed(2)}%`}
          hint="Compounded continuously"
          accent="primary"
          icon={Percent}
        />
        <StatCard
          delay={0.1}
          label="Estimated 30-day"
          value={`+${(rate * 30).toFixed(1)}%`}
          hint="Projection based on current rate"
          accent="gold"
          icon={TrendingUp}
        />
        <StatCard
          delay={0.15}
          label="Last accrual"
          value={
            <span className="text-xl">
              {data?.lastAccrualAt ? formatDate(data.lastAccrualAt) : formatDate(new Date())}
            </span>
          }
          hint="Streaming live"
          icon={Activity}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl">Recent activity</h3>
            <Link to="/transactions" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {!recent.length && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
            {recent.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/[0.025] transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl grid place-items-center ${
                      t.amount >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {t.amount >= 0 ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {t.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-mono ${t.amount >= 0 ? 'text-primary' : 'text-destructive'}`}
                  >
                    {t.amount >= 0 ? '+' : ''}
                    {formatMoney(t.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatMoney(t.balanceAfter)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="font-display text-xl mb-5">Snapshot</h3>
          <div className="space-y-4 text-sm">
            <Row label="Total deposited" value={formatMoney(snapshot.deposited)} />
            <Row label="Interest earned" value={formatMoney(snapshot.interest)} pos />
            <Row label="Withdrawals" value={formatMoney(snapshot.withdrawals)} />
            <div className="border-t border-black/5 my-3" />
            <Row label="Account status" value={<Badge status="approved" />} />
            <Row label="Account opened" value={formatDate(user?.createdAt ?? new Date())} />
          </div>
        </Panel>
      </div>
    </>
  );
}
