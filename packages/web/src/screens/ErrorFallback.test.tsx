import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { ErrorFallback } from './ErrorFallback';

const mockError = new Error('Test error message');
const mockUseAuth = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useRouteError: () => mockError,
}));

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ErrorFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      logOut: vi.fn(),
      loading: false,
    });
  });

  it('renders Error heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<ErrorFallback />, { wrapper });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders Something Went Wrong message', () => {
    const { wrapper } = generateTestWrapper();
    render(<ErrorFallback />, { wrapper });
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
  });

  it('renders the error message', () => {
    const { wrapper } = generateTestWrapper();
    render(<ErrorFallback />, { wrapper });
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders description text', () => {
    const { wrapper } = generateTestWrapper();
    render(<ErrorFallback />, { wrapper });
    expect(screen.getByText(/unexpected error/)).toBeInTheDocument();
  });

  it('shows "Go to Home" when user is not authenticated', () => {
    const { wrapper } = generateTestWrapper();
    render(<ErrorFallback />, { wrapper });
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });
});

describe('ErrorFallback (authenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Go to App" when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@test.com', emailVerified: true },
      logOut: vi.fn(),
      loading: false,
    });
    const { wrapper } = generateTestWrapper();
    render(<ErrorFallback />, { wrapper });
    expect(screen.getByText('Go to App')).toBeInTheDocument();
  });
});
