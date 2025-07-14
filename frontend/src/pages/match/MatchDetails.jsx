// src/pages/match/MatchDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMatch } from '../../utils/api';

export default function MatchDetails() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMatch(id);
      setMatch(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>;
  if (!match) return <div className="text-center text-red-400">Match not found</div>;

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] text-center">{match.teams?.map(t => t.name).join(' vs ')}</h1>
      <div className="text-sm text-[var(--color-secondary-accent)] text-center">{match.date?.slice(0, 10)} | {match.status}</div>
      <div className="text-base mt-2">Score: {match.score || 'N/A'}</div>
      <div className="text-base mt-2">MVPs: {match.mvps?.join(', ') || 'N/A'}</div>
      <div className="text-base mt-2">Feedback: {match.feedback || 'N/A'}</div>
      <div className="text-base mt-2">Stats: {JSON.stringify(match.stats)}</div>
    </div>
  );
}