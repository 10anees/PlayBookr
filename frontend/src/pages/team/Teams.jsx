import { useEffect, useState } from 'react';
import { getTeams } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sport: '', city: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getTeams(filters);
      setTeams(data);
      setLoading(false);
    })();
  }, [filters]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Teams</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input placeholder="City" className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
        <select className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={filters.sport} onChange={e => setFilters(f => ({ ...f, sport: e.target.value }))}>
          <option value="">All Sports</option>
          <option value="cricket">Cricket</option>
          <option value="futsal">Futsal</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
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