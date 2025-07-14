import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', city: user?.city || '', bio: user?.bio || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await updateUser(form);
      setUser(updated);
      navigate('/profile');
    } catch {
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-2">Edit Profile</h2>
      {error && <div className="text-red-400 text-center text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold">Name</label>
          <input id="name" name="name" type="text" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.name} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="city" className="text-sm font-semibold">City</label>
          <input id="city" name="city" type="text" className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.city} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="text-sm font-semibold">Bio</label>
          <textarea id="bio" name="bio" rows={3} className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.bio} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
} 