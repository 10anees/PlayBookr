import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArena, updateArena } from '../../utils/api';

export default function ManageArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [arena, setArena] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', description: '', pricePerHour: '', sports: [], availability: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getArena(id);
      setArena(data);
      setForm({
        name: data.name || '',
        city: data.location?.city || '',
        description: data.description || '',
        pricePerHour: data.pricePerHour || '',
        sports: data.sports || [],
        availability: data.availability?.map(a => `${a.day}: ${a.slots.join(',')}`).join(' | ') || ''
      });
      setLoading(false);
    })();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSportsChange = e => {
    const { value, checked } = e.target;
    setForm(f => ({ ...f, sports: checked ? [...f.sports, value] : f.sports.filter(s => s !== value) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateArena(id, {
        name: form.name,
        location: { city: form.city },
        description: form.description,
        pricePerHour: form.pricePerHour,
        sports: form.sports,
        availability: form.availability.split('|').map(s => {
          const [day, slots] = s.split(':');
          return { day: day.trim(), slots: slots ? slots.split(',').map(x => x.trim()) : [] };
        })
      });
      setSuccess('Arena updated!');
      setTimeout(() => navigate('/my-arenas'), 1200);
    } catch {
      setError('Update failed');
    }
  };

  if (loading) return <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>;
  if (!arena) return <div className="text-center text-red-400">Arena not found</div>;

  return (
    <div className="max-w-xl mx-auto bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-2">Manage Arena</h2>
      {error && <div className="text-red-400 text-center text-sm">{error}</div>}
      {success && <div className="text-green-400 text-center text-sm">{success}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Name</label>
          <input name="name" type="text" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={form.name} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">City</label>
          <input name="city" type="text" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={form.city} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Description</label>
          <textarea name="description" rows={3} className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={form.description} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Price Per Hour</label>
          <input name="pricePerHour" type="number" required className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={form.pricePerHour} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Sports</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1"><input type="checkbox" value="cricket" checked={form.sports.includes('cricket')} onChange={handleSportsChange} /> Cricket</label>
            <label className="flex items-center gap-1"><input type="checkbox" value="futsal" checked={form.sports.includes('futsal')} onChange={handleSportsChange} /> Futsal</label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Availability (e.g. Monday: 10am-12pm,2pm-4pm | Tuesday: 8am-10am)</label>
          <input name="availability" type="text" className="px-4 py-2 rounded bg-[var(--color-main-bg)] border border-[var(--color-primary)] text-[var(--color-text)]" value={form.availability} onChange={handleChange} />
        </div>
        <button type="submit" className="w-full py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Save Changes</button>
      </form>
    </div>
  );
} 