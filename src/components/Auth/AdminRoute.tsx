import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthenticated } = useAuthStore();

  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}