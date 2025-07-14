import { useEffect, useState } from 'react';
import { getMyArenas } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function MyArenas() {
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMyArenas();
      setArenas(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">My Arenas</h1>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : arenas.length === 0 ? (
        <div className="text-center text-[var(--color-text)]">No arenas found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arenas.map(arena => (
            <div key={arena._id} className="bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2">
              <div className="w-full h-32 bg-[var(--color-main-bg)] rounded-lg flex items-center justify-center text-4xl mb-2">🏟️</div>
              <div className="font-bold text-lg text-[var(--color-primary)]">{arena.name}</div>
              <div className="text-sm text-[var(--color-secondary-accent)]">{arena.location?.city}</div>
              <div className="text-sm">Status: {arena.approved ? 'Approved' : 'Pending'}</div>
              <Link to={`/manage-arena/${arena._id}`} className="mt-2 px-4 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition text-center">Manage</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 