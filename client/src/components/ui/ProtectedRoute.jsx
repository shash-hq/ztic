import {Navigate, useLocation} from 'react-router-dom';
import {useAuthStore} from '../../store/authStore.js';

/**
 * Usage:
 *   <ProtectedRoute>                     → any authenticated user
 *   <ProtectedRoute roles={['organizer','admin']}>  → role-gated
 */
export default function ProtectedRoute({children, roles = []}) {
  const location = useLocation();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const user = useAuthStore(s => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
