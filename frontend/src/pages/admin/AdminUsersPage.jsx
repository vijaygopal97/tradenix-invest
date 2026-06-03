import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

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

  return (
    <div className="page">
      <h1>User management</h1>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn primary">
          Search
        </button>
      </form>
      <p className="muted">{total} users</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{formatMoney(u.balance)}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/users/${u._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
