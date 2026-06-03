import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Panel, SectionTitle, Badge, TableWrap, Th, Td } from '../../components/ui-bits';
import { api } from '../../api/client';
import { formatMoney, formatDate } from '../../lib/format';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/users/${id}`).then((res) => setData(res.data));
  }, [id]);

  if (!data) {
    return <div className="text-muted-foreground">Loading…</div>;
  }

  const { user, recharges, withdrawals, transactions } = data;

  return (
    <>
      <Link to="/admin/users" className="text-sm text-primary hover:underline">
        ← Users
      </Link>
      <SectionTitle
        eyebrow="User detail"
        title={user.name}
        subtitle={user.email}
        right={
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-display text-3xl text-gradient">{formatMoney(user.balance)}</div>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <Panel className="lg:col-span-2">
          <h3 className="font-display text-lg mb-4">Recharges</h3>
          <MiniTable
            rows={recharges}
            cols={[
              (r) => formatDate(r.createdAt),
              (r) => formatMoney(r.amount),
              (r) => <Badge status={r.status} />,
            ]}
          />
        </Panel>
        <Panel>
          <h3 className="font-display text-lg mb-4">Withdrawals</h3>
          <MiniTable
            rows={withdrawals}
            cols={[
              (r) => formatDate(r.createdAt),
              (r) => formatMoney(r.amount),
              (r) => <Badge status={r.status} />,
            ]}
          />
        </Panel>
      </div>

      <Panel className="mt-5">
        <h3 className="font-display text-lg mb-4">Transactions</h3>
        <MiniTable
          rows={transactions}
          cols={[
            (r) => formatDate(r.createdAt),
            (r) => r.type.replace(/_/g, ' '),
            (r) => formatMoney(r.amount),
          ]}
        />
      </Panel>
    </>
  );
}

function MiniTable({ rows, cols }) {
  if (!rows?.length) return <p className="text-sm text-muted-foreground">None</p>;
  return (
    <TableWrap>
      <tbody>
        {rows.map((r) => (
          <tr key={r._id} className="hover:bg-black/[0.02]">
            {cols.map((c, i) => (
              <Td key={i}>{c(r)}</Td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}
