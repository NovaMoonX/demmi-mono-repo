import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Auth } from './Auth';

const mockNavigate = vi.fn();
const mockSignIn = vi.fn().mockResolvedValue({});
const mockSignUp = vi.fn().mockResolvedValue({});
const mockSignInWithGoogle = vi.fn().mockResolvedValue({});

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

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
    renderWithProviders(<Auth />);
    expect(screen.getByText('Welcome to Demmi')).toBeInTheDocument();
  });

  it('renders the sign-in subtitle', () => {
    renderWithProviders(<Auth />);
    expect(
      screen.getByText('Sign in or create an account to start cooking'),
    ).toBeInTheDocument();
  });

  it('renders the back to home button', () => {
    renderWithProviders(<Auth />);
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
  });

  it('navigates home when back button is clicked', () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByText('← Back to Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders the try demo mode button', () => {
    renderWithProviders(<Auth />);
    expect(screen.getByText('🎭 Try Demo Mode')).toBeInTheDocument();
  });

  it('navigates to /chat when try demo is clicked', async () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByText('🎭 Try Demo Mode'));
    await new Promise((r) => setTimeout(r, 0));
    expect(mockNavigate).toHaveBeenCalledWith('/chat');
  });
});
