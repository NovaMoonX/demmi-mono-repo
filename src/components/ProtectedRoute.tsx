import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useAppSelector } from '@store/hooks';
import Loading from '@ui/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);

  if (loading) {
    return <Loading />;
  }

  if (!user && !isDemoActive) {
    return <Navigate to="/auth" replace />;
  }

  // Only check email verification for real authenticated users; demo users bypass this entirely
  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
