import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role }) {
  const { user, role: userRole, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex justify-center items-center h-40 text-lg text-[var(--color-primary)]">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (userRole !== role) return <Navigate to="/arenas" replace />;
  return <Outlet />;
} 