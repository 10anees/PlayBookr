import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  return (
    <nav className="w-full bg-[var(--color-secondary-bg)] text-[var(--color-text)] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
          <span className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">🏟️</span>
          PlayBookr
        </Link>
        {/* Nav Links */}
        <div className="hidden md:flex gap-6 items-center">
          <NavLink to="/arenas" className={({isActive}) => isActive ? 'text-[var(--color-secondary-accent)] font-semibold' : ''}>Arenas</NavLink>
          <NavLink to="/teams" className={({isActive}) => isActive ? 'text-[var(--color-secondary-accent)] font-semibold' : ''}>Teams</NavLink>
          <NavLink to="/leaderboard" className={({isActive}) => isActive ? 'text-[var(--color-secondary-accent)] font-semibold' : ''}>Leaderboard</NavLink>
          <NavLink to="/tournaments" className={({isActive}) => isActive ? 'text-[var(--color-secondary-accent)] font-semibold' : ''}>Tournaments</NavLink>
          <NavLink to="/chat" className={({isActive}) => isActive ? 'text-[var(--color-secondary-accent)] font-semibold' : ''}>Chat</NavLink>
        </div>
        {/* User Menu */}
        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-1 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition">Login</Link>
              <Link to="/register" className="px-4 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="font-semibold hover:text-[var(--color-secondary-accent)]">{user.name || 'Profile'}</Link>
              <button onClick={logout} className="px-3 py-1 rounded-full bg-[var(--color-secondary-accent)] text-[var(--color-main-bg)] font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 