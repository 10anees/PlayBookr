import { useState } from 'react';
import { changePassword } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.new !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.new });
      setSuccess('Password changed successfully');
      setTimeout(() => navigate('/profile'), 1200);
    } catch {
      setError('Change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-2">Change Password</h2>
      {error && <div className="text-red-400 text-center text-sm">{error}</div>}
      {success && <div className="text-green-400 text-center text-sm">{success}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="current" className="text-sm font-semibold">Current Password</label>
          <input id="current" name="current" type="password" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.current} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="new" className="text-sm font-semibold">New Password</label>
          <input id="new" name="new" type="password" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.new} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm" className="text-sm font-semibold">Confirm New Password</label>
          <input id="confirm" name="confirm" type="password" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.confirm} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Change Password'}</button>
      </form>
    </div>
  );
} 