// src/pages/tournament/TournamentDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTournament } from '../../utils/api';

export default function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getTournament(id);
      setTournament(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>;
  if (!tournament) return <div className="text-center text-red-400">Tournament not found</div>;

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] text-center">{tournament.name}</h1>
      <div className="text-sm text-[var(--color-secondary-accent)] text-center">{tournament.sport} • {tournament.city}</div>
      <div className="text-base mt-2">Teams: {tournament.teams?.map(t => t.name).join(', ')}</div>
      <div className="text-base mt-2">Status: {tournament.status}</div>
      <div className="text-base mt-2">Description: {tournament.description}</div>
    </div>
  );
}