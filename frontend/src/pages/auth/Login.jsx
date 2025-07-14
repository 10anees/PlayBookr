import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/arenas';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-main-bg)] text-[var(--color-text)] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-2">Login</h2>
        {error && <div className="text-red-400 text-center text-sm">{error}</div>}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold">Email</label>
          <input id="email" type="email" autoComplete="email" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold">Password</label>
          <input id="password" type="password" autoComplete="current-password" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Logging in...' : 'Login'}</button>
        <div className="text-center text-sm mt-2">Don't have an account? <Link to="/register" className="text-[var(--color-secondary-accent)] hover:underline">Sign Up</Link></div>
      </form>
    </div>
  );
} 