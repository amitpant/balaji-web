import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';

// Social media and Settings tabs edit parts of one settings record; saves send the whole record.
export function useSiteSettings() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-settings'], queryFn: () => api('/admin/settings') });
  const [edits, setEdits] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const base = query.data ? { stats: [], trustBadges: [], social: {}, marketing: {}, ...query.data } : null;
  const draft = edits ?? base;

  const update = (patch) => setEdits((d) => ({ ...(d ?? base), ...patch }));

  async function save() {
    setBusy(true);
    setErrors({});
    setMessage(null);
    try {
      const saved = await api('/admin/settings', { method: 'PUT', body: draft });
      qc.setQueryData(['admin-settings'], saved);
      qc.invalidateQueries({ queryKey: ['public-settings'] });
      setEdits(null);
      setMessage({ kind: 'success', text: 'Saved. The website is updated.' });
    } catch (err) {
      setErrors(err.fields || {});
      setMessage({ kind: 'error', text: Object.keys(err.fields || {}).length ? 'Please fix the highlighted fields.' : err.message });
    } finally {
      setBusy(false);
    }
  }

  return { draft, update, save, errors, message, busy, isLoading: query.isLoading, error: query.error };
}
