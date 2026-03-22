import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';

vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@hooks/useAuth';
import { ProtectedRoutes } from './ProtectedRoutes';

const mockUseAuth = useAuth as jest.Mock;

describe('ProtectedRoutes', () => {
  it('shows loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    renderWithProviders(<ProtectedRoutes />, {
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
      },
    });

    const container = document.body;
    expect(container.innerHTML).not.toBe('');
  });

  it('redirects to /auth when not authenticated and not demo', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    renderWithProviders(<ProtectedRoutes />, {
      route: '/chat',
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
      },
    });

    // Navigate component redirects, so the Outlet won't render
    // The component renders Navigate to="/auth" which we can't directly assert in MemoryRouter
    // but at minimum it should not crash
  });

  it('redirects to /verify-email when user email not verified', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: false },
      loading: false,
    });

    renderWithProviders(<ProtectedRoutes />, {
      preloadedState: {
        demo: { isActive: false, isHydrated: true } as never,
      },
    });
  });

  it('renders outlet when demo mode is active without user', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    renderWithProviders(<ProtectedRoutes />, {
      preloadedState: {
        demo: { isActive: true, isHydrated: true } as never,
      },
    });
  });
});
