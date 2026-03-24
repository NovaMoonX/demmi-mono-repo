import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { VerifyEmail } from './VerifyEmail';

const mockLogOut = vi.fn().mockResolvedValue(undefined);
const mockResendVerificationEmail = vi.fn().mockResolvedValue({});
const mockAddToast = vi.fn();

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
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
  });

  it('renders the user email', () => {
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('renders instructions text', () => {
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    expect(
      screen.getByText(
        'Please check your inbox and click the verification link to continue.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the resend button', () => {
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    expect(screen.getByText('Resend Verification Email')).toBeInTheDocument();
  });

  it('renders the sign out button', () => {
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls logOut when Sign Out is clicked', () => {
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogOut).toHaveBeenCalled();
  });

  it('calls resendVerificationEmail when resend is clicked', () => {
    const { wrapper } = generateTestWrapper();
    render(<VerifyEmail />, { wrapper });
    fireEvent.click(screen.getByText('Resend Verification Email'));
    expect(mockResendVerificationEmail).toHaveBeenCalled();
  });
});
