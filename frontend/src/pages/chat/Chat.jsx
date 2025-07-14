// src/pages/chat/Chat.jsx
import { useEffect, useState } from 'react';
import { getChats } from '../../utils/api';

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getChats();
      setChats(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Chats</h1>
      {loading ? (
        <div className="text-center text-lg text-[var(--color-primary)]">Loading...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {chats.map(chat => (
            <div key={chat._id} className="bg-[var(--color-secondary-bg)] rounded-xl shadow-lg p-4 flex flex-col gap-2">
              <div className="font-bold text-lg text-[var(--color-primary)]">{chat.name || chat.participants?.map(p => p.name).join(', ')}</div>
              <div className="text-sm text-[var(--color-secondary-accent)]">{chat.type}</div>
              <div className="text-sm">Last message: {chat.lastMessage?.content || 'No messages yet'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}