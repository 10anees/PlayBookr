import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArena, getArenaReviews } from '../../utils/api';

export default function ArenaDetails() {
  const { id } = useParams();
  const [arena, setArena] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getArena(id);
      setArena(data);
      const revs = await getArenaReviews(id);
      setReviews(revs);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>;
  if (!arena) return <div className="text-center text-red-400">Arena not found</div>;

  return (
    <div className="max-w-3xl mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-6 flex flex-col gap-6">
      <div className="w-full h-56 bg-[var(--color-main-bg)] rounded-lg flex items-center justify-center text-6xl">🏟️</div>
      <h1 className="text-3xl font-bold text-[var(--color-primary)]">{arena.name}</h1>
      <div className="text-sm text-[var(--color-secondary-accent)]">{arena.location?.city} • {arena.sports?.join(', ')}</div>
      <div className="text-sm">Owner: {arena.owner?.name || 'N/A'}</div>
      <div className="text-sm">Price: ₹{arena.pricePerHour}/hr</div>
      <div className="text-sm">Availability: {arena.availability?.map(a => `${a.day}: ${a.slots.join(', ')}`).join(' | ')}</div>
      <div className="text-base mt-2">{arena.description}</div>
      <button className="mt-4 px-6 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Book Now</button>
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[var(--color-primary)] mb-2">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-sm text-[var(--color-text)]">No reviews yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map(r => (
              <div key={r._id} className="bg-[var(--color-main-bg)] rounded-lg p-4 flex flex-col gap-1">
                <div className="font-semibold text-[var(--color-secondary-accent)]">{r.user?.name || 'User'}</div>
                <div className="text-sm">Rating: {r.rating} ⭐</div>
                <div className="text-sm">{r.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 