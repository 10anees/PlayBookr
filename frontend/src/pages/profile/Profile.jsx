import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="max-w-lg mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-3xl text-white mb-2">👤</div>
        <h2 className="text-2xl font-bold text-[var(--color-primary)]">{user.name}</h2>
        <div className="text-sm text-[var(--color-secondary-accent)]">{user.role}</div>
      </div>
      <div className="flex flex-col gap-2 text-[var(--color-text)]">
        <div><span className="font-semibold">Email:</span> {user.email}</div>
        {user.city && <div><span className="font-semibold">City:</span> {user.city}</div>}
        {user.bio && <div><span className="font-semibold">Bio:</span> {user.bio}</div>}
      </div>
      <div className="flex gap-4 justify-center mt-4">
        <Link to="/profile/edit" className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Edit Profile</Link>
        <Link to="/profile/change-password" className="px-4 py-2 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition">Change Password</Link>
      </div>
    </div>
  );
} 