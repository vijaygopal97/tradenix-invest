import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminShell, UserShell } from './components/Shell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import InvestPage from './pages/user/InvestPage';
import WithdrawPage from './pages/user/WithdrawPage';
import TransactionsPage from './pages/user/TransactionsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminInterestPage from './pages/admin/AdminInterestPage';
import AdminBankPage from './pages/admin/AdminBankPage';
import AdminRechargesPage from './pages/admin/AdminRechargesPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute role="user" />}>
          <Route element={<UserShell />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/invest" element={<InvestPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/interest" element={<AdminInterestPage />} />
            <Route path="/admin/bank" element={<AdminBankPage />} />
            <Route path="/admin/recharges" element={<AdminRechargesPage />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
