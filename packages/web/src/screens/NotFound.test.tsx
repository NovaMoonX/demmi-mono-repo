import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotFound } from './NotFound';

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

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
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders Page Not Found message', () => {
    render(<NotFound />);
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<NotFound />);
    expect(screen.getByText(/couldn't find the page/)).toBeInTheDocument();
  });

  it('shows "Go to Home" when user is not authenticated', () => {
    render(<NotFound />);
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('navigates to / when button is clicked', () => {
    render(<NotFound />);
    fireEvent.click(screen.getByText('Go to Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
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
    render(<NotFound />);
    expect(screen.getByText('Return to App')).toBeInTheDocument();
  });
});
