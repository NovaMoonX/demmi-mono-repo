import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from './ErrorFallback';

const mockNavigate = jest.fn();
const mockError = new Error('Test error message');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useRouteError: () => mockError,
}));

jest.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logOut: jest.fn(),
    loading: false,
  }),
}));

describe('ErrorFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    jest.clearAllMocks();
  });

  it('shows "Go to App" when user is authenticated', () => {
    jest.spyOn(require('@hooks/useAuth'), 'useAuth').mockReturnValue({
      user: { uid: 'test-user', email: 'test@test.com', emailVerified: true },
      logOut: jest.fn(),
      loading: false,
    });
    render(<ErrorFallback />);
    expect(screen.getByText('Go to App')).toBeInTheDocument();
  });
});

describe('ErrorFallback (no error)', () => {
  it('does not render error box when error is falsy', () => {
    jest.spyOn(require('react-router-dom'), 'useRouteError').mockReturnValue(null);
    render(<ErrorFallback />);
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
  });
});
