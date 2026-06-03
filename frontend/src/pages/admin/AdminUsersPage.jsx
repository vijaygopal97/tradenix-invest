import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../../api/client';
import {
  Panel,
  SectionTitle,
  Input,
  TableWrap,
  Th,
  Td,
} from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

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

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <>
      <SectionTitle
        eyebrow="User management"
        title="Investors"
        subtitle="Search investors, review balances and open full account history."
      />

      <Panel className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-11"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>
            Total: <b className="text-foreground">{total}</b>
          </span>
          <span>
            Showing: <b className="text-foreground">{filtered.length}</b>
          </span>
        </div>
      </Panel>

      <Panel className="p-0 overflow-hidden">
        <TableWrap>
          <thead>
            <tr>
              <Th>User</Th>
              <Th className="text-right">Balance</Th>
              <Th>Joined</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {!filtered.length && (
              <tr>
                <Td colSpan={4} className="text-center text-muted-foreground">
                  No users match your search.
                </Td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-white/[0.02] transition">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 grid place-items-center text-sm font-semibold">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td className="text-right font-mono">{formatMoney(u.balance)}</Td>
                <Td className="text-muted-foreground">{formatDate(u.createdAt)}</Td>
                <Td className="text-right">
                  <Link
                    to={`/admin/users/${u._id}`}
                    className="text-primary text-xs hover:underline"
                  >
                    View details →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>
    </>
  );
}
