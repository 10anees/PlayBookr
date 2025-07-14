import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'player' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/arenas');
    } catch {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-main-bg)] text-[var(--color-text)] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-2">Sign Up</h2>
        {error && <div className="text-red-400 text-center text-sm">{error}</div>}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold">Name</label>
          <input id="name" name="name" type="text" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.name} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold">Email</label>
          <input id="email" name="email" type="email" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.email} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold">Password</label>
          <input id="password" name="password" type="password" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.password} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm" className="text-sm font-semibold">Confirm Password</label>
          <input id="confirm" name="confirm" type="password" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.confirm} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="text-sm font-semibold">Role</label>
          <select id="role" name="role" className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={form.role} onChange={handleChange}>
            <option value="player">Player</option>
            <option value="arena_owner">Arena Owner</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Signing up...' : 'Sign Up'}</button>
        <div className="text-center text-sm mt-2">Already have an account? <Link to="/login" className="text-[var(--color-secondary-accent)] hover:underline">Login</Link></div>
      </form>
    </div>
  );
} 