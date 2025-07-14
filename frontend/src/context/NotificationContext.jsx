import { createContext, useContext, useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, deleteNotification } from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const markRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const remove = async (id) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
} 