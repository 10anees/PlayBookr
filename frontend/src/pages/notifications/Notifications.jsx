import { useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export default function Notifications() {
  const { notifications, fetchNotifications, markRead, remove } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-center text-[var(--color-text)]">No notifications.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map(n => (
            <div key={n._id} className={`bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2 ${n.read ? '' : 'border-l-4 border-[var(--color-secondary-accent)]'}`}>
              <div className="font-bold text-[var(--color-primary)]">{n.title}</div>
              <div className="text-sm">{n.body}</div>
              <div className="flex gap-2 mt-2">
                {!n.read && <button onClick={() => markRead(n._id)} className="px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] text-xs">Mark as read</button>}
                <button onClick={() => remove(n._id)} className="px-3 py-1 rounded-full bg-red-500 text-white text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 