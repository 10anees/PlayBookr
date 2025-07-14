// src/pages/tournament/Tournaments.jsx
import { useEffect, useState } from 'react';
import { getTournaments } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getTournaments();
      setTournaments(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Tournaments</h1>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(tournament => (
            <Link to={`/tournaments/${tournament._id}`} key={tournament._id} className="bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2 hover:scale-[1.02] transition">
              <div className="font-bold text-lg text-[var(--color-primary)]">{tournament.name}</div>
              <div className="text-sm text-[var(--color-secondary-accent)]">{tournament.sport} • {tournament.city}</div>
              <div className="text-sm">Teams: {tournament.teams?.length}</div>
              <div className="text-sm">Status: {tournament.status}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}