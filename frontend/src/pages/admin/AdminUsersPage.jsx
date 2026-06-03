import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  AdminCellDate,
  AdminCellMoney,
  AdminCellUser,
  AdminDataTable,
  AdminMetaStrip,
  AdminPageHeader,
  AdminSearchForm,
  AdminTableRow,
  AdminToolbar,
} from '../../components/AdminDataUI';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n ?? 0);
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    const { data } = await api.get('/admin/users', { params: { search: search || undefined } });
    setUsers(data.users);
    setTotal(data.total);
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'balance', label: 'Balance' },
    { key: 'joined', label: 'Joined' },
    { key: 'actions', label: '', className: 'admin-col-actions' },
  ];

  return (
    <div className="page">
      <AdminPageHeader
        title="User management"
        subtitle="Search investors, review balances, and open full account history."
      />
      <AdminToolbar>
        <AdminSearchForm
          value={search}
          onChange={setSearch}
          onSubmit={load}
          placeholder="Search by name or email"
        />
      </AdminToolbar>
      <AdminMetaStrip items={[{ label: 'Total users', value: total }, { label: 'Results', value: users.length }]} />
      <AdminDataTable
        columns={columns}
        empty={
          users.length === 0
            ? search
              ? 'No users match your search.'
              : 'No registered users yet.'
            : null
        }
        colSpan={columns.length}
      >
        {users.map((u) => (
          <AdminTableRow key={u._id}>
            <AdminCellUser name={u.name} email={u.email} />
            <AdminCellMoney amount={u.balance} formatMoney={formatMoney} />
            <AdminCellDate date={u.createdAt} />
            <td className="admin-cell-actions">
              <Link className="admin-link" to={`/admin/users/${u._id}`}>
                View details →
              </Link>
            </td>
          </AdminTableRow>
        ))}
      </AdminDataTable>
    </div>
  );
}
