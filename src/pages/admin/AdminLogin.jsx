import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { Button, Input, Notice } from './ui.jsx';

export default function AdminLogin() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      qc.setQueryData(['me'], data);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-soft px-5">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-bg p-8">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Website</Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Admin login</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={error?.fields?.email}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={error?.fields?.password}
            required
          />
          {error && !Object.keys(error.fields || {}).length && <Notice kind="error">{error.message}</Notice>}
          <Button type="submit" disabled={busy} className="mt-2 py-3">
            {busy ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
