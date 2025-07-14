// src/pages/match/Matches.jsx
import { useEffect, useState } from 'react';
import { getMatches } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMatches();
      setMatches(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Matches</h1>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : matches.length === 0 ? (
        <div className="text-center text-[var(--color-text)]">No matches found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <Link to={`/matches/${match._id}`} key={match._id} className="bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2 hover:scale-[1.02] transition">
              <div className="font-bold text-lg text-[var(--color-primary)]">{match.teams?.map(t => t.name).join(' vs ')}</div>
              <div className="text-sm text-[var(--color-secondary-accent)]">{match.date?.slice(0, 10)} | {match.status}</div>
              <div className="text-sm">Score: {match.score || 'N/A'}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}