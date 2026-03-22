import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from './ErrorFallback';

const mockNavigate = vi.fn();
const mockError = new Error('Test error message');
const mockUseAuth = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
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
    render(<ErrorFallback />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders Something Went Wrong message', () => {
    render(<ErrorFallback />);
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
  });

  it('renders the error message', () => {
    render(<ErrorFallback />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<ErrorFallback />);
    expect(screen.getByText(/unexpected error/)).toBeInTheDocument();
  });

  it('shows "Go to Home" when user is not authenticated', () => {
    render(<ErrorFallback />);
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('navigates to / when button is clicked', () => {
    render(<ErrorFallback />);
    fireEvent.click(screen.getByText('Go to Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
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
    render(<ErrorFallback />);
    expect(screen.getByText('Go to App')).toBeInTheDocument();
  });
});
