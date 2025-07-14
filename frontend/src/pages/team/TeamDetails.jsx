import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTeam } from '../../utils/api';

export default function TeamDetails() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getTeam(id);
      setTeam(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>;
  if (!team) return <div className="text-center text-red-400">Team not found</div>;

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-6 flex flex-col gap-6">
      <div className="w-20 h-20 bg-[var(--color-main-bg)] rounded-full flex items-center justify-center text-4xl mx-auto">👥</div>
      <h1 className="text-3xl font-bold text-[var(--color-primary)] text-center">{team.name}</h1>
      <div className="text-sm text-[var(--color-secondary-accent)] text-center">{team.city} • {team.sport}</div>
      <div className="flex flex-col gap-2 mt-4">
        <div className="font-semibold">Members:</div>
        <div className="flex flex-wrap gap-2">
          {team.members?.map(m => <span key={m._id} className="px-3 py-1 rounded-full bg-[var(--color-main-bg)] text-[var(--color-text)] text-xs">{m.name}</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <div className="font-semibold">Stats:</div>
        <div className="text-sm">Wins: {team.wins} | Losses: {team.losses} | Draws: {team.draws}</div>
        <div className="text-sm">Total Matches: {team.total_matches}</div>
        {team.sport === 'cricket' && <div className="text-sm">Runs: {team.totalRuns} | Wickets: {team.totalWickets}</div>}
        {team.sport === 'futsal' && <div className="text-sm">Goals: {team.totalGoals}</div>}
      </div>
      <button className="mt-4 px-6 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Join/Leave Team</button>
    </div>
  );
} 