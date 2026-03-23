import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { NotFound } from './NotFound';

const mockUseAuth = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      logOut: vi.fn(),
      loading: false,
    });
  });

  it('renders 404 heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<NotFound />, { wrapper });
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders Page Not Found message', () => {
    const { wrapper } = generateTestWrapper();
    render(<NotFound />, { wrapper });
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders description text', () => {
    const { wrapper } = generateTestWrapper();
    render(<NotFound />, { wrapper });
    expect(screen.getByText(/couldn't find the page/)).toBeInTheDocument();
  });

  it('shows "Go to Home" when user is not authenticated', () => {
    const { wrapper } = generateTestWrapper();
    render(<NotFound />, { wrapper });
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });
});

describe('NotFound (authenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Return to App" when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@test.com', emailVerified: true },
      logOut: vi.fn(),
      loading: false,
    });
    const { wrapper } = generateTestWrapper();
    render(<NotFound />, { wrapper });
    expect(screen.getByText('Return to App')).toBeInTheDocument();
  });
});
