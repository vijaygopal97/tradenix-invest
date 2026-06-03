import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Percent, Coins } from 'lucide-react';
import { api } from '../../api/client';
import {
  Panel,
  SectionTitle,
  StatusFilterPills,
  TableWrap,
  Th,
  Td,
} from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

const iconFor = {
  recharge_approved: ArrowDownLeft,
  withdrawal_requested: ArrowUpRight,
  withdrawal_rejected_refund: ArrowDownLeft,
  interest_accrual: Percent,
};

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'recharge', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'interest', label: 'Interest' },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('all');

  useEffect(() => {
    api.get('/user/transactions').then((res) => setTransactions(res.data.transactions));
  }, []);

  const filtered = useMemo(() => {
    if (type === 'all') return transactions;
    if (type === 'recharge') return transactions.filter((t) => t.type.includes('recharge'));
    if (type === 'withdrawal') return transactions.filter((t) => t.type.includes('withdrawal'));
    if (type === 'interest') return transactions.filter((t) => t.type.includes('interest'));
    return transactions;
  }, [transactions, type]);

  return (
    <>
      <SectionTitle
        eyebrow="Ledger"
        title="Transaction history"
        subtitle="Every credit and debit, accounted for."
      />

      <StatusFilterPills options={TABS} value={type} onChange={setType} />

      <Panel className="p-0 overflow-hidden mt-5">
        <TableWrap>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th className="text-right">Amount</Th>
              <Th className="text-right">Balance</Th>
              <Th>Note</Th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length && (
              <tr>
                <Td colSpan={5} className="text-center text-muted-foreground">
                  No transactions found.
                </Td>
              </tr>
            )}
            {filtered.map((t) => {
              const Icon = iconFor[t.type] ?? Coins;
              const positive = t.amount >= 0;
              return (
                <tr key={t._id} className="hover:bg-black/[0.02] transition">
                  <Td className="text-muted-foreground whitespace-nowrap">
                    {formatDate(t.createdAt)}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-8 w-8 rounded-lg grid place-items-center ${
                          positive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="capitalize">{t.type.replace(/_/g, ' ')}</span>
                    </div>
                  </Td>
                  <Td
                    className={`text-right font-mono ${positive ? 'text-primary' : 'text-destructive'}`}
                  >
                    {positive ? '+' : ''}
                    {formatMoney(t.amount)}
                  </Td>
                  <Td className="text-right font-mono text-muted-foreground">
                    {formatMoney(t.balanceAfter)}
                  </Td>
                  <Td className="text-muted-foreground">{t.note || '—'}</Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Panel>
    </>
  );
}
