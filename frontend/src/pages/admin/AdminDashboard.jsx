// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { getAdminDashboard, getAdminUsers, getAdminArenas, getAdminReviews } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [arenas, setArenas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setStats(await getAdminDashboard());
      setUsers(await getAdminUsers());
      setArenas(await getAdminArenas());
      setReviews(await getAdminReviews());
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Admin Dashboard</h1>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : (
        <>
          <div className="mb-6">
            <div className="font-bold text-lg">Stats</div>
            <pre className="bg-[var(--color-main-bg)] rounded p-2 text-xs">{JSON.stringify(stats, null, 2)}</pre>
          </div>
          <div className="mb-6">
            <div className="font-bold text-lg">Users</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {users.map(u => (
                <div key={u._id} className="bg-[var(--color-secondary-bg)] rounded p-2">{u.name} ({u.role})</div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="font-bold text-lg">Arenas</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {arenas.map(a => (
                <div key={a._id} className="bg-[var(--color-secondary-bg)] rounded p-2">{a.name} ({a.approved ? 'Approved' : 'Pending'})</div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-lg">Reviews</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {reviews.map(r => (
                <div key={r._id} className="bg-[var(--color-secondary-bg)] rounded p-2">{r.comment}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}