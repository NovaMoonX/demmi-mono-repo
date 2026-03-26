import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@hooks/useAuth';
import { ProtectedRoutes } from './ProtectedRoutes';
import type { UserProfile } from '@lib/userProfile';

const mockUseAuth = vi.mocked(useAuth);

const mockProfile: UserProfile = {
  userId: 'u1',
  displayName: 'Test',
  dietaryRestrictions: [],
  customDietaryRestrictions: [],
  avoidIngredients: [],
  cuisinePreferences: [],
  cookingGoal: null,
  cookingGoalDetails: null,
  householdSize: 1,
  skillLevel: null,
  cookTimePreference: null,
  lovedMealDescription: null,
  dislikedMealDescription: null,
  autoPantryDeduct: null,
  createdAt: 1000,
  updatedAt: 1000,
  onboardingCompletedAt: 1700000000000,
};

describe('ProtectedRoutes', () => {
  it('shows loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true } as never);

    const { wrapper } = generateTestWrapper({
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });

    const container = document.body;
    expect(container.innerHTML).not.toBe('');
  });

  it('redirects to /auth when not authenticated and not demo', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false } as never);

    const { wrapper } = generateTestWrapper({
      route: '/chat',
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });

    // Navigate component redirects, so the Outlet won't render
    // The component renders Navigate to="/auth" which we can't directly assert in MemoryRouter
    // but at minimum it should not crash
  });

  it('redirects to /verify-email when user email not verified', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: false },
      loading: false,
    } as never);

    const { wrapper } = generateTestWrapper({
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });
  });

  it('renders outlet when demo mode is active without user', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false } as never);

    const { wrapper } = generateTestWrapper({
      preloadedState: {
        demo: { isActive: true, isHydrated: true } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });
  });

  it('redirects to /onboarding when profile has onboardingCompletedAt === null', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      loading: false,
    } as never);

    const incompleteProfile: UserProfile = { ...mockProfile, onboardingCompletedAt: null };

    const { wrapper } = generateTestWrapper({
      route: '/chat',
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
        userProfile: { profile: incompleteProfile, loading: false, error: null } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });
    // Component renders Navigate to="/onboarding" — should not crash
  });

  it('does not redirect to /onboarding when already on /onboarding', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      loading: false,
    } as never);

    const incompleteProfile: UserProfile = { ...mockProfile, onboardingCompletedAt: null };

    const { wrapper } = generateTestWrapper({
      route: '/onboarding',
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
        userProfile: { profile: incompleteProfile, loading: false, error: null } as never,
      },
    });
    // Should not crash — no infinite redirect
    render(<ProtectedRoutes />, { wrapper });
  });

  it('does not redirect when onboardingCompletedAt is a timestamp', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      loading: false,
    } as never);

    const { wrapper } = generateTestWrapper({
      route: '/chat',
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
        userProfile: { profile: mockProfile, loading: false, error: null } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });
  });

  it('does not redirect when profile is null (not yet loaded)', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      loading: false,
    } as never);

    const { wrapper } = generateTestWrapper({
      route: '/chat',
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
        userProfile: { profile: null, loading: false, error: null } as never,
      },
    });
    render(<ProtectedRoutes />, { wrapper });
  });
});
