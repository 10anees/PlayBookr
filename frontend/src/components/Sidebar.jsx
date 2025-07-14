import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { role } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-56 h-full bg-[var(--color-secondary-bg)] text-[var(--color-text)] shadow-lg py-8 px-4 gap-2">
      <NavLink to="/arenas" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>🏟️ Arenas</NavLink>
      <NavLink to="/teams" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>👥 Teams</NavLink>
      <NavLink to="/leaderboard" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>🏆 Leaderboard</NavLink>
      <NavLink to="/tournaments" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>🎫 Tournaments</NavLink>
      <NavLink to="/chat" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>💬 Chat</NavLink>
      <NavLink to="/notifications" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>🔔 Notifications</NavLink>
      {role === 'arena_owner' && (
        <>
          <div className="mt-4 mb-1 text-xs text-[var(--color-secondary-accent)] uppercase tracking-wider">Owner</div>
          <NavLink to="/my-arenas" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>🏟️ My Arenas</NavLink>
        </>
      )}
      {role === 'admin' && (
        <>
          <div className="mt-4 mb-1 text-xs text-[var(--color-secondary-accent)] uppercase tracking-wider">Admin</div>
          <NavLink to="/admin" className={({isActive}) => isActive ? 'font-bold text-[var(--color-secondary-accent)] flex items-center gap-2 py-2' : 'flex items-center gap-2 py-2 hover:text-[var(--color-secondary-accent)]'}>🛡️ Dashboard</NavLink>
        </>
      )}
    </aside>
  );
} 