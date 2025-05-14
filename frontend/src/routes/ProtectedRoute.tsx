import { Navigate, useLocation } from 'react-router';
import { useAuth } from 'src/contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const location = useLocation();

  const publicRoutes = ["/auth/verify-info", "/auth/reset-password", "/auth/action"];

  if (!user && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user && !user.emailVerified && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/auth/verify-info" replace />;
  }

  return children;
};

export default ProtectedRoute;
