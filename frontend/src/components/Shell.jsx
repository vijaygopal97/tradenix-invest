import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function UserShell() {
  const { user, logout } = useAuth();
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/invest', label: 'Invest' },
    { to: '/withdraw', label: 'Withdraw' },
    { to: '/transactions', label: 'History' },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">TV</span>
          <div>
            <strong>Tradenix Venture</strong>
            <small>Credit growth platform</small>
          </div>
        </div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-chip">
          <span>{user?.name}</span>
          <button type="button" className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminShell() {
  const { user, logout } = useAuth();
  const links = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/interest', label: 'Interest' },
    { to: '/admin/bank', label: 'Bank details' },
    { to: '/admin/recharges', label: 'Recharges' },
    { to: '/admin/withdrawals', label: 'Withdrawals' },
  ];

  return (
    <div className="app-shell admin">
      <aside className="sidebar">
        <div className="brand stacked">
          <span className="brand-mark">TV</span>
          <strong>Tradenix Admin</strong>
        </div>
        <nav className="side-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p>{user?.email}</p>
          <button type="button" className="btn ghost full" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export function AuthLayout({ title, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand centered">
          <span className="brand-mark">TV</span>
          <strong>Tradenix Venture</strong>
        </Link>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}
