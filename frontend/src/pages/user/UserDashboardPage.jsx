import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Percent, Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Panel, SectionTitle, StatCard } from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

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
    setTransactions(tx.data.transactions.slice(0, 5));
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const rate = data?.dailyInterestPercent ?? 0;
  const dailyEarn = ((data?.balance ?? 0) * rate) / 100;

  return (
    <>
      <SectionTitle
        eyebrow="Dashboard"
        title={`Good day, ${user?.name?.split(' ')[0] ?? 'Investor'}`}
        subtitle="Your capital compounds from the configured daily interest rate."
      />
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <Panel className="relative overflow-hidden mb-6">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
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
              className="font-display text-5xl lg:text-6xl mt-3 text-gradient tabular-nums"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 text-sm"
              >
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </Link>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard
          delay={0.05}
          label="Daily interest"
          value={`${rate}%`}
          hint="Set by admin"
          accent="primary"
          icon={Percent}
        />
        <StatCard
          delay={0.1}
          label="Estimated 30-day"
          value={`+${(rate * 30).toFixed(1)}%`}
          hint="Projection at current rate"
          accent="gold"
          icon={TrendingUp}
        />
        <StatCard
          delay={0.15}
          label="Last accrual sync"
          value={
            <span className="text-xl">
              {data?.lastAccrualAt ? formatDate(data.lastAccrualAt) : '—'}
            </span>
          }
          hint="Updates every 5 seconds"
          icon={Activity}
        />
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl">Recent activity</h3>
          <Link to="/transactions" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {!transactions.length && (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
          {transactions.map((t) => (
            <div
              key={t._id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition"
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
    </>
  );
}
