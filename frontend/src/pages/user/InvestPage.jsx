import { useEffect, useState } from 'react';
import { Upload, Copy, Check, Banknote, Sparkles } from 'lucide-react';
import { api, uploadUrl } from '../../api/client';
import {
  Panel,
  SectionTitle,
  Field,
  Input,
  Textarea,
  Button,
  Alert,
  Badge,
} from '../../components/ui-bits';
import { formatMoney, formatDate } from '../../lib/format';

function BankRow({ label, value, k, copied, onCopy, mono }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.03] border border-black/5">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, k)}
        className="h-9 w-9 grid place-items-center rounded-lg hover:bg-black/[0.04] transition"
      >
        {copied === k ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

export default function InvestPage() {
  const [bank, setBank] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [file, setFile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = async () => {
    const [bankRes, reqRes] = await Promise.all([
      api.get('/user/platform-bank'),
      api.get('/user/recharges'),
    ]);
    setBank(bankRes.data.bank);
    setRequests(reqRes.data.requests);
  };

  useEffect(() => {
    load().catch(() => setError('Failed to load invest page'));
  }, []);

  const copy = (v, k) => {
    navigator.clipboard?.writeText(v).then(() => {
      setCopied(k);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!file) {
      setError('Please upload a payment screenshot');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('amount', amount);
      form.append('paymentDescription', paymentDescription.trim());
      form.append('screenshot', file);
      await api.post('/user/recharges', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAmount('');
      setPaymentDescription('');
      setFile(null);
      e.target.reset();
      setMessage('Recharge submitted for admin approval.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionTitle
        eyebrow="Add funds"
        title="Invest"
        subtitle="Transfer to our verified account, then attach your receipt."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
              <Banknote className="h-4 w-4" /> Platform bank
            </div>
            <h2 className="font-display text-2xl mt-2">Send funds to</h2>
            {!bank ? (
              <p className="text-sm text-muted-foreground mt-4">
                Bank details not configured yet. Contact support.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                <BankRow
                  label="Account holder"
                  value={bank.accountHolderName}
                  k="h"
                  copied={copied}
                  onCopy={copy}
                />
                <BankRow label="Bank" value={bank.bankName} k="b" copied={copied} onCopy={copy} />
                <BankRow
                  label="Account number"
                  value={bank.accountNumber}
                  k="a"
                  copied={copied}
                  onCopy={copy}
                  mono
                />
                <BankRow
                  label="IFSC / SWIFT"
                  value={bank.ifscOrSwift}
                  k="i"
                  copied={copied}
                  onCopy={copy}
                  mono
                />
                {bank.branch && (
                  <BankRow label="Branch" value={bank.branch} k="r" copied={copied} onCopy={copy} />
                )}
              </div>
            )}
            {bank?.instructions && (
              <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary/90 flex gap-2">
                <Sparkles className="h-4 w-4 shrink-0" />
                {bank.instructions}
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Submit recharge</h2>
          <p className="text-sm text-muted-foreground mt-1">Attach the receipt for verification.</p>
          {message && (
            <div className="mt-4">
              <Alert tone="success">{message}</Alert>
            </div>
          )}
          {error && (
            <div className="mt-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
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
            <Field
              label="Payment note"
              hint="UTR, reference, payer name — anything helping verification."
            >
              <Textarea
                rows={3}
                maxLength={500}
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                placeholder="e.g. UTR 88231100"
              />
            </Field>
            <Field label="Payment screenshot">
              <label className="block border-2 border-dashed border-black/10 hover:border-primary/50 rounded-xl px-5 py-8 cursor-pointer transition text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm">{file ? file.name : 'Drop or click to upload'}</div>
              </label>
            </Field>
            <Button type="submit" full disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </Button>
          </form>
        </Panel>
      </div>

      <Panel className="mt-6">
        <h3 className="font-display text-xl mb-4">Recent recharges</h3>
        <div className="space-y-2">
          {!requests.length && (
            <p className="text-sm text-muted-foreground">No recharges yet.</p>
          )}
          {requests.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] hover:bg-black/[0.04] transition flex-wrap gap-3"
            >
              <div>
                <div className="font-mono text-sm">{formatMoney(r.amount)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(r.createdAt)} · {r.paymentDescription || '—'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={r.status} />
                <a
                  href={uploadUrl(r.screenshotUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Screenshot
                </a>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
