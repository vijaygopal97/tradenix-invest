import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { api } from '../../api/client';
import { Panel, SectionTitle, Field, Input, Button, Alert } from '../../components/ui-bits';

const empty = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscOrSwift: '',
  branch: '',
  instructions: '',
};

const labels = {
  accountHolderName: 'Account holder',
  bankName: 'Bank name',
  accountNumber: 'Account number',
  ifscOrSwift: 'IFSC / SWIFT',
  branch: 'Branch',
  instructions: 'Instructions',
};

export default function AdminBankPage() {
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/platform-bank').then((res) => {
      if (res.data.bank) setForm({ ...empty, ...res.data.bank });
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await api.put('/admin/platform-bank', form);
    setMessage('Platform bank details saved.');
  };

  return (
    <>
      <SectionTitle
        eyebrow="Configuration"
        title="Platform bank details"
        subtitle="Shown to users on the Invest page for recharge transfers."
      />

      <Panel className="max-w-lg">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent mb-4">
          <Building2 className="h-4 w-4" /> Deposit account
        </div>
        {message && (
          <div className="mb-4">
            <Alert tone="success">{message}</Alert>
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          {Object.keys(empty).map((key) => (
            <Field key={key} label={labels[key]}>
              <Input
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== 'branch' && key !== 'instructions'}
              />
            </Field>
          ))}
          <Button type="submit">Save details</Button>
        </form>
      </Panel>
    </>
  );
}
