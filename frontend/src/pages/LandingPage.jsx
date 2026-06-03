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
} from 'lucide-react';

function Curve() {
  const pts = [10, 14, 12, 22, 18, 30, 26, 38, 34, 48, 44, 60, 56, 72, 78];
  const max = Math.max(...pts);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 100} ${100 - (p / max) * 95}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32 mt-6">
      <defs>
        <linearGradient id="landing-cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.16 84)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.82 0.16 84)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 100 100 L 0 100 Z`} fill="url(#landing-cg)" />
      <path
        d={d}
        stroke="oklch(0.82 0.16 84)"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <header className="relative z-20">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center font-display font-bold text-primary-foreground">
              T
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold">Tradenix</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Venture
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition">
              How it works
            </a>
            <a href="#features" className="hover:text-foreground transition">
              Features
            </a>
            <a href="#trust" className="hover:text-foreground transition">
              Trust
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-full hover:bg-white/5 transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:scale-[1.03] transition"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-36">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Credit growth platform — <span className="text-primary font-mono">daily interest</span>
            </span>
          </div>
          <h1 className="mt-6 font-display font-semibold tracking-tight text-5xl lg:text-7xl leading-[1.05]">
            Capital that <span className="text-gradient-gold">compounds</span> while you sleep.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Tradenix Venture is engineered for serious investors. Deposit, watch your balance accrue,
            withdraw on your schedule — from one obsessively clean interface.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold shine-on-hover hover:shadow-[0_15px_40px_-10px] hover:shadow-primary/60 transition"
            >
              Open an account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/10 hover:bg-white/5 transition"
            >
              Sign in to dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-white/5 py-5 overflow-hidden bg-ink/40">
        <div className="flex gap-12 animate-ticker whitespace-nowrap">
          {[...Array(2)].flatMap((_, k) =>
            [
              'Daily interest accrual',
              'Verified recharges',
              'Secure withdrawals',
              'Admin-reviewed payouts',
              'Transparent rates',
              'Real-time balance',
            ].map((t, i) => (
              <span key={`${k}-${i}`} className="text-sm text-muted-foreground font-mono">
                <span className="mr-2 text-primary">●</span>
                {t}
              </span>
            ))
          )}
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary mb-3">Why Tradenix</div>
          <h2 className="font-display text-4xl lg:text-5xl tracking-tight">
            Designed for clarity, built for compounding.
          </h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {[
            {
              i: Zap,
              t: 'Real-time accrual',
              d: 'Your balance grows as daily interest compounds on approved credits.',
            },
            {
              i: Clock,
              t: 'Fast recharges',
              d: 'Upload payment proof and get verified by admin before funds credit.',
            },
            {
              i: Lock,
              t: 'Bank-grade security',
              d: 'JWT auth, role-based access, and reviewed withdrawals every step.',
            },
            {
              i: TrendingUp,
              t: 'Transparent yields',
              d: 'Admin-set rates with full history. No hidden lock-ups.',
            },
            {
              i: ShieldCheck,
              t: 'Verified withdrawals',
              d: 'Payouts to your saved bank account with admin payment proof.',
            },
            {
              i: Sparkles,
              t: 'Effortless UX',
              d: 'A console so clean your numbers do the talking.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 group hover:border-primary/30 transition"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center group-hover:bg-primary/20 transition">
                <f.i className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-xl">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-primary mb-3">How it works</div>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tight">Three steps to compounding.</h2>
            <div className="mt-10 space-y-6">
              {[
                { n: '01', t: 'Create an account', d: 'Register in under a minute.' },
                { n: '02', t: 'Recharge your wallet', d: 'Transfer to our bank and attach the receipt.' },
                { n: '03', t: 'Watch it grow', d: 'Daily interest compounds. Withdraw when you want.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-5">
                  <div className="font-display text-3xl text-gradient-gold w-14 shrink-0">{s.n}</div>
                  <div>
                    <h3 className="font-display text-xl">{s.t}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel-strong p-8">
            <div className="text-xs text-muted-foreground">Platform snapshot</div>
            <div className="font-display text-5xl mt-2 text-gradient">Invest</div>
            <div className="text-sm text-muted-foreground">with confidence</div>
            <Curve />
          </div>
        </div>
      </section>

      <section id="trust" className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative glass-panel-strong overflow-hidden p-12 lg:p-20 text-center">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/30 blur-[120px]" />
          <h2 className="relative font-display text-4xl lg:text-6xl tracking-tight">
            Your money deserves
            <br />a better operating system.
          </h2>
          <p className="relative mt-5 text-muted-foreground max-w-xl mx-auto">
            Join Tradenix Venture and start compounding today.
          </p>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold shine-on-hover"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 mt-10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between text-xs text-muted-foreground gap-4">
          <div>© 2026 Tradenix Venture. All rights reserved.</div>
          <div>Capital at risk. Past performance is not indicative of future returns.</div>
        </div>
      </footer>
    </div>
  );
}
