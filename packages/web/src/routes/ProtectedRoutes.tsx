import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useAppSelector } from '@store/hooks';
import Loading from '@ui/Loading';

export function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);
  const isDemoHydrated = useAppSelector((state) => state.demo.isHydrated);
  const profile = useAppSelector((state) => state.userProfile.profile);
  const { pathname } = useLocation();

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

  // Redirect to onboarding if profile exists but onboarding has not been completed
  if (profile !== null && profile?.onboardingCompletedAt === null && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
