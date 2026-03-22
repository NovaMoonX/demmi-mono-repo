import { render, screen, fireEvent } from '@testing-library/react';
import { NotFound } from './NotFound';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logOut: jest.fn(),
    loading: false,
  }),
}));

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    jest.clearAllMocks();
  });

  it('shows "Return to App" when user is authenticated', () => {
    jest.spyOn(require('@hooks/useAuth'), 'useAuth').mockReturnValue({
      user: { uid: 'test-user', email: 'test@test.com', emailVerified: true },
      logOut: jest.fn(),
      loading: false,
    });
    render(<NotFound />);
    expect(screen.getByText('Return to App')).toBeInTheDocument();
  });
});
