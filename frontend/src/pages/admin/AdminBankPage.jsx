import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const empty = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscOrSwift: '',
  branch: '',
  instructions: '',
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
    <div className="page">
      <h1>Platform bank details</h1>
      <p className="lead">Shown to users on the Invest page.</p>
      {message && <p className="success">{message}</p>}
      <form onSubmit={onSubmit} className="form panel narrow">
        {Object.keys(empty).map((key) => (
          <label key={key}>
            {key.replace(/([A-Z])/g, ' $1')}
            <input
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== 'branch' && key !== 'instructions'}
            />
          </label>
        ))}
        <button type="submit" className="btn primary">
          Save
        </button>
      </form>
    </div>
  );
}
