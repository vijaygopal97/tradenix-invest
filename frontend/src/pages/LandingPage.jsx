import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Lock,
  Sparkles,
  LineChart,
  PiggyBank,
  Wallet,
  BadgeCheck,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  INK,
  INK_SOFT,
  CREAM,
  PAPER,
  LINE,
  EMERALD,
  EMERALD_SOFT,
  GOLD,
  GOLD_SOFT,
  MUTED,
} from '../theme/landing';

function NavActions({ user, dashboardTo, dashboardLabel }) {
  if (user) {
    return (
      <Link
        to={dashboardTo}
        className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full font-semibold transition hover:scale-[1.03] text-white"
        style={{
          background: `linear-gradient(135deg, ${INK} 0%, ${EMERALD} 120%)`,
          boxShadow: `0 10px 30px -12px ${INK}66`,
        }}
      >
        <LayoutDashboard className="h-4 w-4" />
        {dashboardLabel}
      </Link>
    );
  }
  return (
    <>
      <Link
        to="/login"
        className="text-sm px-4 py-2 rounded-full transition hover:bg-black/[0.04]"
        style={{ color: INK }}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className="text-sm px-4 py-2 rounded-full font-semibold transition hover:scale-[1.03] text-white"
        style={{
          background: `linear-gradient(135deg, ${INK} 0%, ${EMERALD} 120%)`,
          boxShadow: `0 10px 30px -12px ${INK}66`,
        }}
      >
        Get started
      </Link>
    </>
  );
}

function HeroCtas({ user, dashboardTo }) {
  if (user) {
    return (
      <Link
        to={dashboardTo}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white transition hover:translate-y-[-1px]"
        style={{
          background: `linear-gradient(135deg, ${INK} 0%, ${EMERALD} 120%)`,
          boxShadow: `0 18px 40px -16px ${EMERALD}80`,
        }}
      >
        Go to dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <>
      <Link
        to="/register"
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white transition hover:translate-y-[-1px]"
        style={{
          background: `linear-gradient(135deg, ${INK} 0%, ${EMERALD} 120%)`,
          boxShadow: `0 18px 40px -16px ${EMERALD}80`,
        }}
      >
        Open an account <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full transition hover:bg-black/[0.04]"
        style={{
          border: `1px solid ${LINE}`,
          background: PAPER,
          color: INK,
        }}
      >
        Sign in to dashboard
      </Link>
    </>
  );
}

function CtaButton({ user, dashboardTo }) {
  if (user) {
    return (
      <Link
        to={dashboardTo}
        className="relative inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-full font-semibold"
        style={{
          background: `linear-gradient(135deg, ${EMERALD} 0%, ${GOLD} 130%)`,
          color: INK,
          boxShadow: `0 20px 50px -20px ${EMERALD}`,
        }}
      >
        Open dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <Link
      to="/register"
      className="relative inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-full font-semibold"
      style={{
        background: `linear-gradient(135deg, ${EMERALD} 0%, ${GOLD} 130%)`,
        color: INK,
        boxShadow: `0 20px 50px -20px ${EMERALD}`,
      }}
    >
      Get started — it's free <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const dashboardTo = user?.role === 'admin' ? '/admin' : '/dashboard';
  const dashboardLabel = user?.role === 'admin' ? 'Admin dashboard' : 'Dashboard';

  if (loading) {
    return (
      <div
        className="min-h-screen grid place-items-center font-sans"
        style={{ background: CREAM, color: MUTED }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden font-sans"
      style={{
        color: INK,
        background: `
          radial-gradient(1100px 600px at 85% -10%, ${GOLD_SOFT} 0%, transparent 60%),
          radial-gradient(900px 500px at -10% 10%, ${EMERALD_SOFT} 0%, transparent 60%),
          ${CREAM}
        `,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `
            linear-gradient(${INK}0F 1px, transparent 1px),
            linear-gradient(90deg, ${INK}0F 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)',
        }}
      />

      <header className="relative z-20">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center font-display font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${INK} 0%, ${EMERALD} 100%)`,
              }}
            >
              T
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold" style={{ color: INK }}>
                Tradenix
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
                Venture
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: MUTED }}>
            <a href="#how" className="hover:opacity-80 transition" style={{ color: MUTED }}>
              How it works
            </a>
            <a href="#features" className="hover:opacity-80 transition">
              Features
            </a>
            <a href="#trust" className="hover:opacity-80 transition">
              Trust
            </a>
          </div>
          <div className="flex items-center gap-2">
            <NavActions user={user} dashboardTo={dashboardTo} dashboardLabel={dashboardLabel} />
          </div>
        </nav>
      </header>

      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                color: INK,
                boxShadow: `0 1px 0 ${LINE}`,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: EMERALD }} />
              <span style={{ color: MUTED }}>
                Compounding at{' '}
                <span className="font-mono font-semibold" style={{ color: EMERALD }}>
                  1.40% / day
                </span>
              </span>
            </div>

            <h1
              className="mt-6 font-display font-semibold tracking-tight text-5xl lg:text-6xl xl:text-7xl leading-[1.04]"
              style={{ color: INK }}
            >
              Your capital,{' '}
              <span
                style={{
                  background: `linear-gradient(135deg, ${EMERALD} 0%, ${GOLD} 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                growing every second.
              </span>
            </h1>
            <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: MUTED }}>
              Tradenix Venture is a modern credit growth platform engineered for serious investors.
              Deposit, watch your balance accrue daily interest, withdraw on your schedule — all from
              one obsessively clean console.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <HeroCtas user={user} dashboardTo={dashboardTo} />
            </div>

            <div
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs"
              style={{ color: MUTED }}
            >
              {[
                { i: ShieldCheck, t: '256-bit encrypted' },
                { i: BadgeCheck, t: 'RBI-aligned bank routing' },
                { i: Lock, t: 'Admin-audited withdrawals' },
              ].map((b) => (
                <div key={b.t} className="inline-flex items-center gap-1.5">
                  <b.i className="h-3.5 w-3.5" style={{ color: EMERALD }} />
                  {b.t}
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 max-w-lg gap-8">
              {[
                { v: '₹284 Cr', l: 'Capital under platform' },
                { v: '12,400+', l: 'Active investors' },
                { v: '1.4%', l: 'Avg. daily yield' },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="font-display text-2xl font-semibold" style={{ color: INK }}>
                    {s.v}
                  </div>
                  <div className="text-xs mt-1" style={{ color: MUTED }}>
                    {s.l}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-md"
          >
            <div
              className="relative rounded-3xl p-6"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                boxShadow: `0 30px 60px -30px ${INK}40, 0 8px 24px -12px ${INK}1F`,
              }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: MUTED }}>
                <span>Portfolio balance</span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ background: EMERALD }}
                  />
                  Streaming
                </span>
              </div>
              <div className="font-display text-4xl mt-2 font-semibold" style={{ color: INK }}>
                ₹1,42,580.<span style={{ color: MUTED }}>42</span>
              </div>
              <div className="text-xs mt-1 font-mono" style={{ color: EMERALD }}>
                + ₹19.83 this minute · +42.18% this month
              </div>

              <MiniChart />

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { l: 'Daily', v: '+1.40%', c: EMERALD, bg: EMERALD_SOFT },
                  { l: 'Weekly', v: '+9.8%', c: EMERALD, bg: EMERALD_SOFT },
                  { l: '30-day', v: '+42.1%', c: GOLD, bg: GOLD_SOFT },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl p-3" style={{ background: m.bg }}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>
                      {m.l}
                    </div>
                    <div className="font-mono mt-1 font-semibold" style={{ color: m.c }}>
                      {m.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-6 -left-6 rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                boxShadow: `0 16px 30px -16px ${INK}33`,
              }}
            >
              <div
                className="h-9 w-9 rounded-full grid place-items-center"
                style={{ background: EMERALD_SOFT }}
              >
                <TrendingUp className="h-4 w-4" style={{ color: EMERALD }} />
              </div>
              <div>
                <div className="text-[10px]" style={{ color: MUTED }}>
                  Withdrawal sent
                </div>
                <div className="text-sm font-medium" style={{ color: INK }}>
                  ₹25,000 → ICICI
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-6 -right-4 rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                boxShadow: `0 16px 30px -16px ${INK}33`,
              }}
            >
              <div
                className="h-9 w-9 rounded-full grid place-items-center"
                style={{ background: GOLD_SOFT }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: GOLD }} />
              </div>
              <div>
                <div className="text-[10px]" style={{ color: MUTED }}>
                  Verified
                </div>
                <div className="text-sm font-medium" style={{ color: INK }}>
                  256-bit secured
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: EMERALD }}>
            Why Tradenix
          </div>
          <h2 className="font-display text-4xl lg:text-5xl tracking-tight" style={{ color: INK }}>
            Designed for clarity, built for compounding.
          </h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {[
            {
              i: Zap,
              t: 'Real-time accrual',
              d: 'Watch your balance grow every few seconds as daily interest compounds in front of your eyes.',
            },
            {
              i: Clock,
              t: 'Instant recharges',
              d: 'Upload your payment proof, get verified within hours, and start earning before the next sunrise.',
            },
            {
              i: Lock,
              t: 'Bank-grade security',
              d: 'End-to-end encryption, role-isolated access, and admin-reviewed withdrawals — every step audited.',
            },
            {
              i: LineChart,
              t: 'Transparent yields',
              d: 'Admin-set rates published with full history. No surprise fees, no hidden lock-ups.',
            },
            {
              i: PiggyBank,
              t: 'Verified withdrawals',
              d: 'Each payout is processed against your saved bank account with proof attached.',
            },
            {
              i: Wallet,
              t: 'Effortless UX',
              d: 'A console so clean it almost disappears — your numbers do all the talking.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl p-6 transition hover:translate-y-[-2px]"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                boxShadow: `0 1px 0 ${LINE}, 0 18px 30px -24px ${INK}1F`,
              }}
            >
              <div
                className="h-11 w-11 rounded-xl grid place-items-center transition"
                style={{ background: EMERALD_SOFT }}
              >
                <f.i className="h-5 w-5" style={{ color: EMERALD }} />
              </div>
              <h3 className="mt-4 font-display text-xl" style={{ color: INK }}>
                {f.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
                {f.d}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: EMERALD }}>
              How it works
            </div>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tight" style={{ color: INK }}>
              Three steps to compounding.
            </h2>
            <div className="mt-10 space-y-6">
              {[
                {
                  n: '01',
                  t: 'Create an account',
                  d: 'Register in under 60 seconds. No paperwork rituals.',
                },
                {
                  n: '02',
                  t: 'Recharge your wallet',
                  d: 'Transfer to our verified bank account and attach the receipt.',
                },
                {
                  n: '03',
                  t: 'Watch it grow',
                  d: 'Daily interest compounds automatically. Withdraw whenever you want.',
                },
              ].map((s) => (
                <div key={s.n} className="flex gap-5">
                  <div
                    className="font-display text-3xl w-14 shrink-0 font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${EMERALD}, ${GOLD})`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-display text-xl" style={{ color: INK }}>
                      {s.t}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: MUTED }}>
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-3xl p-8"
            style={{
              background: PAPER,
              border: `1px solid ${LINE}`,
              boxShadow: `0 30px 60px -30px ${INK}33`,
            }}
          >
            <div className="text-xs" style={{ color: MUTED }}>
              Today's snapshot
            </div>
            <div className="font-display text-5xl mt-2 font-semibold" style={{ color: INK }}>
              +₹1,980.<span style={{ color: EMERALD }}>42</span>
            </div>
            <div className="text-sm" style={{ color: MUTED }}>
              earned in last 24h
            </div>
            <BigCurve />
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              {[
                { l: 'Avg rate', v: '1.40%', bg: CREAM, c: INK },
                { l: 'Yield 30d', v: '+42%', bg: EMERALD_SOFT, c: EMERALD },
                { l: 'Streak', v: '128d', bg: GOLD_SOFT, c: GOLD },
              ].map((s) => (
                <div key={s.l} className="rounded-xl p-3" style={{ background: s.bg }}>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>
                    {s.l}
                  </div>
                  <div className="font-mono mt-1 font-semibold" style={{ color: s.c }}>
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="max-w-7xl mx-auto px-6 py-20">
        <div
          className="relative rounded-3xl overflow-hidden p-12 lg:p-20 text-center"
          style={{
            background: `linear-gradient(135deg, ${INK} 0%, ${INK_SOFT} 100%)`,
            color: '#fff',
          }}
        >
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full"
            style={{ background: `${EMERALD}55`, filter: 'blur(120px)' }}
          />
          <div
            className="absolute bottom-0 right-0 h-60 w-60 rounded-full"
            style={{ background: `${GOLD}40`, filter: 'blur(120px)' }}
          />
          <h2 className="relative font-display text-4xl lg:text-6xl tracking-tight">
            Your money deserves
            <br />
            a better operating system.
          </h2>
          <p className="relative mt-5 max-w-xl mx-auto" style={{ color: '#CBD5E1' }}>
            Join 12,400+ investors compounding daily on Tradenix.
          </p>
          <CtaButton user={user} dashboardTo={dashboardTo} />
        </div>
      </section>

      <footer className="mt-10 py-10 px-6" style={{ borderTop: `1px solid ${LINE}` }}>
        <div
          className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between text-xs gap-4"
          style={{ color: MUTED }}
        >
          <div>© 2026 Tradenix Venture. All rights reserved.</div>
          <div>Capital at risk. Past performance is not indicative of future returns.</div>
        </div>
      </footer>
    </div>
  );
}

function MiniChart() {
  const pts = [12, 14, 13, 18, 16, 22, 20, 26, 24, 30, 28, 36, 34, 42, 48];
  const max = Math.max(...pts);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 100} ${100 - (p / max) * 90}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24 mt-4">
      <defs>
        <linearGradient id="mini" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity="0.35" />
          <stop offset="100%" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 100 100 L 0 100 Z`} fill="url(#mini)" />
      <path
        d={d}
        stroke={EMERALD}
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BigCurve() {
  const pts = [10, 14, 12, 22, 18, 30, 26, 38, 34, 48, 44, 60, 56, 72, 78];
  const max = Math.max(...pts);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 100} ${100 - (p / max) * 95}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32 mt-6">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity="0.45" />
          <stop offset="100%" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 100 100 L 0 100 Z`} fill="url(#cg)" />
      <path
        d={d}
        stroke={EMERALD}
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
