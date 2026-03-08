import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useAppSelector } from '@store/hooks';
import Loading from '@ui/Loading';

export function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);
  const isDemoHydrated = useAppSelector((state) => state.demo.isHydrated);

  if (loading || !isDemoHydrated) {
    return <Loading />;
  }

  if (!user && !isDemoActive) {
    return <Navigate to="/auth" replace />;
  }

  // Only check email verification for real authenticated users; demo users bypass this entirely
  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
