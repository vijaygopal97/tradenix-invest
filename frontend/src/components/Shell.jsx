import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Users,
  Percent,
  Building2,
  Inbox,
  LogOut,
  ShieldCheck,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BrandLogo } from './BrandLogo';

function NavItem({ to, icon: Icon, label, end, layoutId, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-xl bg-black/[0.04] border border-black/10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Icon className="relative h-4 w-4 shrink-0" strokeWidth={isActive ? 2.4 : 1.8} />
          <span className="relative">{label}</span>
          {isActive && (
            <div className="relative ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/50" />
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ admin, navItems, user, logout, onNavigate, layoutId, navigate }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <BrandLogo onNavigate={onNavigate} />
          <button
            type="button"
            className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-black/10 hover:bg-black/[0.04]"
            onClick={onNavigate}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {admin && (
          <div className="flex items-center gap-2 px-3">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-primary">
              Admin Console
            </span>
          </div>
        )}
        {!admin && (
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 px-3">
            Personal
          </div>
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain py-1 -mx-1 px-1">
        {navItems.map((i) => (
          <NavItem key={i.to} {...i} layoutId={layoutId} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="glass-panel shrink-0 border-t border-black/5 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground">
            {user?.name?.[0] ?? (admin ? 'A' : 'U')}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            onNavigate?.();
            navigate('/login');
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 rounded-lg border border-black/5 hover:bg-black/[0.04] transition"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );
}

function TopBar({ admin = false, onMenuOpen }) {
  const [rate, setRate] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetcher = admin
      ? () => api.get('/admin/interest').then((r) => r.data.logs?.[0]?.dailyPercent)
      : () => api.get('/user/dashboard').then((r) => r.data.dailyInterestPercent);
    fetcher()
      .then((v) => setRate(v ?? null))
      .catch(() => {});
  }, [admin, location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3.5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden h-9 w-9 shrink-0 grid place-items-center rounded-lg border border-black/10 hover:bg-black/[0.04] transition"
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <BrandLogo small />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.025] border border-black/5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs text-muted-foreground">Live rate</span>
          <span className="text-xs font-mono font-semibold text-primary">
            {rate != null ? `${Number(rate).toFixed(2)}% / day` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative h-9 w-9 grid place-items-center rounded-full border border-black/5 hover:bg-black/[0.04] transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent" />
            <span className="text-sm font-medium">{admin ? 'Admin' : 'Investor'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ShellLayout({ admin, navItems, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const layoutId = admin ? 'nav-active-admin' : 'nav-active-user';
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden cursor-pointer"
            aria-label="Close menu"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
          h-screen max-h-[100dvh] w-[min(280px,85vw)] lg:w-64 shrink-0
          flex flex-col overflow-hidden p-5
          border-r border-black/5 bg-white/90 lg:bg-white/70 backdrop-blur-xl
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent
          admin={admin}
          navItems={navItems}
          user={user}
          logout={logout}
          onNavigate={closeSidebar}
          layoutId={layoutId}
          navigate={navigate}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <TopBar admin={admin} onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {children ?? <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function UserShell() {
  const items = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/invest', icon: ArrowDownLeft, label: 'Invest' },
    { to: '/withdraw', icon: ArrowUpRight, label: 'Withdraw' },
    { to: '/transactions', icon: History, label: 'History' },
  ];
  return <ShellLayout admin={false} navItems={items} />;
}

export function AdminShell() {
  const items = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/interest', icon: Percent, label: 'Interest' },
    { to: '/admin/bank', icon: Building2, label: 'Bank details' },
    { to: '/admin/recharges', icon: Inbox, label: 'Recharges' },
    { to: '/admin/withdrawals', icon: Wallet, label: 'Withdrawals' },
  ];
  return <ShellLayout admin navItems={items} />;
}

function Sparkline() {
  const pts = [10, 18, 14, 28, 22, 36, 32, 48, 42, 56, 60, 72, 68, 82];
  const max = Math.max(...pts);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 100} ${100 - (p / max) * 100}`)
    .join(' ');
  return (
    <div className="mt-6">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24">
        <defs>
          <linearGradient id="auth-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L 100 100 L 0 100 Z`} fill="url(#auth-spark)" />
        <path
          d={d}
          stroke="var(--primary)"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function AuthVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative w-full max-w-md aspect-[4/5]"
    >
      <div className="absolute inset-0 glass-panel-strong p-8 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Portfolio</div>
          <div className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            +12.8%
          </div>
        </div>
        <div className="mt-6">
          <div className="text-xs text-muted-foreground">Total balance</div>
          <div className="font-display text-4xl mt-1 text-gradient">₹4,82,615.20</div>
        </div>
        <Sparkline />
        <div className="mt-auto grid grid-cols-3 gap-3">
          {[
            { l: 'Daily', v: '1.4%' },
            { l: 'Weekly', v: '9.8%' },
            { l: 'MTD', v: '+42K' },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-black/[0.04] p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className="font-mono mt-1 text-sm">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-6 -top-6 glass-panel-strong p-4 w-44"
      >
        <div className="text-xs text-muted-foreground">Interest paid</div>
        <div className="font-mono text-lg mt-1 text-primary">+₹1,980.42</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">Last 24h</div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -left-8 bottom-10 glass-panel-strong p-4 w-48"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <div className="text-xs text-muted-foreground">Secured</div>
        </div>
        <div className="text-sm mt-1 font-medium">256-bit encryption</div>
      </motion.div>
    </motion.div>
  );
}

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col p-8 lg:p-14">
        <BrandLogo />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >
            <h1 className="text-3xl font-display font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-sm text-muted-foreground text-center">{footer}</div>
            )}
          </motion.div>
        </div>
        <div className="text-xs text-muted-foreground/60">© 2026 Tradenix Venture. Capital at risk.</div>
      </div>
      <div className="relative hidden lg:block overflow-hidden border-l border-black/5">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <AuthVisual />
        </div>
      </div>
    </div>
  );
}
