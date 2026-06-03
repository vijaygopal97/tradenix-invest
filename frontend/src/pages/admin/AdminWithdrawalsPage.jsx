import { useEffect, useMemo, useState } from 'react';
import { Check, X, Upload } from 'lucide-react';
import { api, uploadUrl } from '../../api/client';
import {
  Panel,
  SectionTitle,
  StatusFilterPills,
  Input,
  Button,
  Badge,
  Alert,
  TableWrap,
  Th,
  Td,
} from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [remarks, setRemarks] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadAll = () =>
    api.get('/admin/withdrawals').then((res) => setWithdrawals(res.data.withdrawals));

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? withdrawals : withdrawals.filter((w) => w.status === filter)),
    [withdrawals, filter]
  );

  const counts = useMemo(
    () => ({
      all: withdrawals.length,
      pending: withdrawals.filter((w) => w.status === 'pending').length,
      paid: withdrawals.filter((w) => w.status === 'paid').length,
      rejected: withdrawals.filter((w) => w.status === 'rejected').length,
    }),
    [withdrawals]
  );

  const process = async (id, status) => {
    setError('');
    if (status === 'paid' && !proofFiles[id]) {
      setError('Upload payment proof before marking paid.');
      return;
    }
    setBusyId(id);
    try {
      const form = new FormData();
      form.append('status', status);
      form.append('adminRemarks', remarks[id] || '');
      if (proofFiles[id]) form.append('paymentProof', proofFiles[id]);
      await api.patch(`/admin/withdrawals/${id}`, form);
      setProofFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update withdrawal.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <SectionTitle
        eyebrow="Approvals"
        title="Withdrawal queue"
        subtitle="Process payouts, attach proof and notify investors."
      />

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <StatusFilterPills
        options={OPTIONS}
        value={filter}
        onChange={setFilter}
        counts={counts}
      />

      <Panel className="p-0 overflow-hidden mt-5">
        <TableWrap>
          <thead>
            <tr>
              <Th>Requested</Th>
              <Th>User</Th>
              <Th className="text-right">Amount</Th>
              <Th>Bank</Th>
              <Th>Status</Th>
              <Th>Proof</Th>
              <Th>Remarks</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length && (
              <tr>
                <Td colSpan={8} className="text-center text-muted-foreground">
                  Nothing here.
                </Td>
              </tr>
            )}
            {filtered.map((w) => (
              <tr key={w._id} className="hover:bg-white/[0.02] transition">
                <Td className="text-muted-foreground whitespace-nowrap">
                  {formatDate(w.createdAt)}
                </Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-white/[0.06] grid place-items-center text-xs font-semibold">
                      {w.user?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div className="text-sm">{w.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{w.user?.email}</div>
                    </div>
                  </div>
                </Td>
                <Td className="text-right font-mono">{formatMoney(w.amount)}</Td>
                <Td>
                  <div className="text-sm">{w.bankAccount?.bankName}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {w.bankAccount?.accountNumber}
                  </div>
                  {w.bankAccount?.proofUrl && (
                    <a
                      href={uploadUrl(w.bankAccount.proofUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Bank proof
                    </a>
                  )}
                </Td>
                <Td>
                  <Badge status={w.status} />
                </Td>
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
                  ) : w.status === 'pending' ? (
                    <label className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setProofFiles({ ...proofFiles, [w._id]: e.target.files?.[0] })
                        }
                      />
                      <Upload className="h-3.5 w-3.5" />
                      {proofFiles[w._id] ? proofFiles[w._id].name.slice(0, 12) + '…' : 'Upload'}
                    </label>
                  ) : (
                    '—'
                  )}
                </Td>
                <Td>
                  {w.status === 'pending' ? (
                    <Input
                      className="!py-2 !text-xs w-40"
                      placeholder="Optional…"
                      value={remarks[w._id] || ''}
                      onChange={(e) => setRemarks({ ...remarks, [w._id]: e.target.value })}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{w.adminRemarks ?? '—'}</span>
                  )}
                </Td>
                <Td>
                  {w.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === w._id}
                        onClick={() => process(w._id, 'paid')}
                      >
                        <Check className="h-3.5 w-3.5" /> Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === w._id}
                        onClick={() => process(w._id, 'rejected')}
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
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
