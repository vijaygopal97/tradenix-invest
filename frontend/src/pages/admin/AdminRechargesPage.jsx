import { useEffect, useMemo, useState } from 'react';
import { Check, X, Image as ImageIcon } from 'lucide-react';
import { api, uploadUrl } from '../../api/client';
import {
  Panel,
  SectionTitle,
  StatusFilterPills,
  Input,
  Button,
  Badge,
  TableWrap,
  Th,
  Td,
} from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminRechargesPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [remarks, setRemarks] = useState({});

  const loadAll = () =>
    api.get('/admin/recharges').then((res) => setRequests(res.data.requests));

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests]
  );

  const review = async (id, status) => {
    await api.patch(`/admin/recharges/${id}`, {
      status,
      adminRemarks: remarks[id] || '',
    });
    loadAll();
  };

  return (
    <>
      <SectionTitle
        eyebrow="Approvals"
        title="Credit recharges"
        subtitle="Verify screenshots and payment notes before approving credits."
      />

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
              <Th>Submitted</Th>
              <Th>User</Th>
              <Th className="text-right">Amount</Th>
              <Th>Note</Th>
              <Th>Receipt</Th>
              <Th>Status</Th>
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
            {filtered.map((r) => (
              <tr key={r._id} className="hover:bg-black/[0.02] transition">
                <Td className="text-muted-foreground whitespace-nowrap">
                  {formatDate(r.createdAt)}
                </Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-black/[0.06] grid place-items-center text-xs font-semibold">
                      {r.user?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div className="text-sm">{r.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                    </div>
                  </div>
                </Td>
                <Td className="text-right font-mono">{formatMoney(r.amount)}</Td>
                <Td className="text-muted-foreground max-w-[180px] truncate">
                  {r.paymentDescription || '—'}
                </Td>
                <Td>
                  <a
                    href={uploadUrl(r.screenshotUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> View
                  </a>
                </Td>
                <Td>
                  <Badge status={r.status} />
                </Td>
                <Td>
                  {r.status === 'pending' ? (
                    <Input
                      className="!py-2 !text-xs w-44"
                      placeholder="Optional remarks…"
                      value={remarks[r._id] || ''}
                      onChange={(e) => setRemarks({ ...remarks, [r._id]: e.target.value })}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{r.adminRemarks || '—'}</span>
                  )}
                </Td>
                <Td>
                  {r.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => review(r._id, 'approved')}>
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => review(r._id, 'rejected')}>
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
