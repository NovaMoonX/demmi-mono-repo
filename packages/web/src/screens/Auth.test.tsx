import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { Auth } from './Auth';

const mockSignIn = vi.fn().mockResolvedValue({});
const mockSignUp = vi.fn().mockResolvedValue({});
const mockSignInWithGoogle = vi.fn().mockResolvedValue({});

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    logOut: vi.fn(),
    resendVerificationEmail: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth', () => {
  it('renders the welcome heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<Auth />, { wrapper });
    expect(screen.getByText('Welcome to Demmi')).toBeInTheDocument();
  });

  it('renders the sign-in subtitle', () => {
    const { wrapper } = generateTestWrapper();
    render(<Auth />, { wrapper });
    expect(
      screen.getByText('Sign in or create an account to start cooking'),
    ).toBeInTheDocument();
  });

  it('renders the back to home button', () => {
    const { wrapper } = generateTestWrapper();
    render(<Auth />, { wrapper });
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
  });

  it('renders the try demo mode button', () => {
    const { wrapper } = generateTestWrapper();
    render(<Auth />, { wrapper });
    expect(screen.getByText('🎭 Try Demo Mode')).toBeInTheDocument();
  });
});
