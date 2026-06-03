import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { api, uploadUrl } from '../../api/client';
import {
  Panel,
  SectionTitle,
  Field,
  Input,
  Select,
  Button,
  Badge,
  Alert,
  TableWrap,
  Th,
  Td,
} from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

const emptyBank = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscOrSwift: '',
};

export default function WithdrawPage() {
  const [accounts, setAccounts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState(null);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [bankProofFile, setBankProofFile] = useState(null);
  const [bankAccountId, setBankAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [accRes, wRes, dash] = await Promise.all([
      api.get('/user/bank-accounts'),
      api.get('/user/withdrawals'),
      api.get('/user/dashboard'),
    ]);
    setAccounts(accRes.data.accounts);
    setWithdrawals(wRes.data.withdrawals);
    setBalance(dash.data.balance);
    if (accRes.data.accounts.length && !bankAccountId) {
      setBankAccountId(accRes.data.accounts[0]._id);
    }
  };

  useEffect(() => {
    load().catch(() => setError('Failed to load withdraw page'));
  }, []);

  const saveBank = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const form = new FormData();
      Object.entries(bankForm).forEach(([key, val]) => form.append(key, val));
      if (bankProofFile) form.append('accountProof', bankProofFile);
      await api.post('/user/bank-accounts', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBankForm(emptyBank);
      setBankProofFile(null);
      e.target.reset();
      setMessage('Bank account saved.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save bank account');
    }
  };

  const submitWithdrawal = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/user/withdrawals', { bankAccountId, amount: Number(amount) });
      setAmount('');
      setMessage('Withdrawal request submitted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  return (
    <>
      <SectionTitle
        eyebrow="Cash out"
        title="Withdraw"
        subtitle="Funds are sent to your bank after admin approval."
      />

      <Panel className="relative overflow-hidden mb-5">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Available balance
            </div>
            <div className="font-display text-4xl mt-1 text-gradient tabular-nums">
              {formatMoney(balance)}
            </div>
          </div>
        </div>
      </Panel>

      {message && (
        <div className="mb-4">
          <Alert tone="success">{message}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <Panel>
          <h2 className="font-display text-2xl">Add a bank account</h2>
          <form onSubmit={saveBank} className="mt-5 space-y-4">
            <Field label="Account holder name">
              <Input
                value={bankForm.accountHolderName}
                onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                required
              />
            </Field>
            <Field label="Bank name">
              <Input
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                required
              />
            </Field>
            <Field label="Account number">
              <Input
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                required
              />
            </Field>
            <Field label="IFSC / SWIFT">
              <Input
                value={bankForm.ifscOrSwift}
                onChange={(e) => setBankForm({ ...bankForm, ifscOrSwift: e.target.value })}
                required
              />
            </Field>
            <Field
              label="Bank account proof (optional)"
              hint="Cheque, passbook, or net-banking screenshot with account number and IFSC visible."
            >
              <label className="block border-2 border-dashed border-black/10 hover:border-primary/50 rounded-xl px-5 py-6 cursor-pointer transition text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBankProofFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm">
                  {bankProofFile ? bankProofFile.name : 'Upload proof (optional)'}
                </div>
              </label>
            </Field>
            <Button type="submit" variant="outline" full>
              Save account
            </Button>
          </form>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Request payout</h2>
          <form onSubmit={submitWithdrawal} className="mt-5 space-y-4">
            <Field label="Send to">
              <Select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                required
              >
                <option value="">Choose account…</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.bankName} — ••••{a.accountNumber.slice(-4)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Amount (₹)">
              <Input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" full disabled={!accounts.length}>
              Submit request
            </Button>
          </form>
        </Panel>
      </div>

      <Panel className="p-0 overflow-hidden">
        <div className="p-6">
          <h3 className="font-display text-xl">Withdrawal history</h3>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Bank</Th>
              <Th>Status</Th>
              <Th>Remarks</Th>
              <Th>Proof</Th>
            </tr>
          </thead>
          <tbody>
            {!withdrawals.length && (
              <tr>
                <Td colSpan={6} className="text-center text-muted-foreground">
                  No withdrawals yet.
                </Td>
              </tr>
            )}
            {withdrawals.map((w) => (
              <tr key={w._id} className="hover:bg-black/[0.02] transition">
                <Td className="text-muted-foreground">{formatDate(w.createdAt)}</Td>
                <Td className="font-mono">{formatMoney(w.amount)}</Td>
                <Td>{w.bankAccount?.bankName}</Td>
                <Td>
                  <Badge status={w.status} />
                </Td>
                <Td className="text-muted-foreground">{w.adminRemarks || '—'}</Td>
                <Td>
                  {w.paymentProofUrl ? (
                    <a
                      href={uploadUrl(w.paymentProofUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    '—'
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>
    </>
  );
}
