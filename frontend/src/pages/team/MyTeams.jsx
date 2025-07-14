// src/pages/team/MyTeams.jsx
import { useEffect, useState } from 'react';
import { getMyTeams } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMyTeams();
      setTeams(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">My Teams</h1>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : teams.length === 0 ? (
        <div className="text-center text-[var(--color-text)]">No teams found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Link to={`/teams/${team._id}`} key={team._id} className="bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2 hover:scale-[1.02] transition">
              <div className="w-16 h-16 bg-[var(--color-main-bg)] rounded-full flex items-center justify-center text-3xl mb-2">👥</div>
              <div className="font-bold text-lg text-[var(--color-primary)]">{team.name}</div>
              <div className="text-sm text-[var(--color-secondary-accent)]">{team.city} • {team.sport}</div>
              <div className="text-sm">Wins: {team.wins}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}