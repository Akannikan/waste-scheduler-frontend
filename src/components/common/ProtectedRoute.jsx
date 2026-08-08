import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route to require authentication.
 * Optionally restricts to specific roles.
 * Usage: <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to their own dashboard
    const home = user.role === 'admin' ? '/admin/dashboard' : user.role === 'collector' ? '/collector/dashboard' : '/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}
