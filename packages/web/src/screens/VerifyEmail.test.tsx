import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { VerifyEmail } from './VerifyEmail';

const mockNavigate = vi.fn();
const mockLogOut = vi.fn().mockResolvedValue(undefined);
const mockResendVerificationEmail = vi.fn().mockResolvedValue({});
const mockAddToast = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@test.com', emailVerified: false },
    loading: false,
    logOut: mockLogOut,
    resendVerificationEmail: mockResendVerificationEmail,
  }),
}));

vi.mock('@moondreamsdev/dreamer-ui/hooks', () => ({
  useToast: () => ({ addToast: mockAddToast }),
  useActionModal: () => ({ confirm: vi.fn() }),
  useTheme: () => ({ resolvedTheme: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('@lib/firebase/firebase.config', () => ({
  auth: {
    currentUser: {
      reload: vi.fn().mockResolvedValue(undefined),
      emailVerified: false,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('VerifyEmail', () => {
  it('renders the verify email heading', () => {
    renderWithProviders(<VerifyEmail />);
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
  });

  it('renders the user email', () => {
    renderWithProviders(<VerifyEmail />);
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('renders instructions text', () => {
    renderWithProviders(<VerifyEmail />);
    expect(
      screen.getByText(
        'Please check your inbox and click the verification link to continue.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the resend button', () => {
    renderWithProviders(<VerifyEmail />);
    expect(screen.getByText('Resend Verification Email')).toBeInTheDocument();
  });

  it('renders the sign out button', () => {
    renderWithProviders(<VerifyEmail />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls logOut when Sign Out is clicked', () => {
    renderWithProviders(<VerifyEmail />);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogOut).toHaveBeenCalled();
  });

  it('calls resendVerificationEmail when resend is clicked', () => {
    renderWithProviders(<VerifyEmail />);
    fireEvent.click(screen.getByText('Resend Verification Email'));
    expect(mockResendVerificationEmail).toHaveBeenCalled();
  });
});
