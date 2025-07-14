// src/pages/leaderboard/Leaderboard.jsx
import { useEffect, useState } from 'react';
import { getTeamLeaderboard } from '../../utils/api';

export default function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getTeamLeaderboard({ sport });
      setTeams(data);
      setLoading(false);
    })();
  }, [sport]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Leaderboard</h1>
      <select className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)] mb-6" value={sport} onChange={e => setSport(e.target.value)}>
        <option value="">All Sports</option>
        <option value="cricket">Cricket</option>
        <option value="futsal">Futsal</option>
      </select>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, i) => (
            <div key={team._id} className="bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2">
              <div className="font-bold text-lg text-[var(--color-primary)]">#{i + 1} {team.name}</div>
              <div className="text-sm text-[var(--color-secondary-accent)]">{team.city} • {team.sport}</div>
              <div className="text-sm">Wins: {team.wins}</div>
              <div className="text-sm">Goals: {team.totalGoals || '-'} | Runs: {team.totalRuns || '-'} | Wickets: {team.totalWickets || '-'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}