import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import {
  signUp,
  signIn,
  signInWithGoogle,
  logOut,
  resendVerificationEmail,
  convertFirebaseUser,
} from './auth.service';

const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockSignInPopup = signInWithPopup as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockSendVerification = sendEmailVerification as jest.Mock;

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('creates user and sends verification email', async () => {
      mockCreateUser.mockResolvedValue({
        user: { uid: 'u1', email: 'a@b.com', emailVerified: false },
      });
      mockSendVerification.mockResolvedValue(undefined);

      const result = await signUp('a@b.com', 'password123');
      expect(result.user).toEqual({
        uid: 'u1',
        email: 'a@b.com',
        emailVerified: false,
      });
      expect(result.error).toBeUndefined();
      expect(mockSendVerification).toHaveBeenCalled();
    });

    it('returns error on failure', async () => {
      mockCreateUser.mockRejectedValue(new Error('Email already in use'));

      const result = await signUp('a@b.com', 'password123');
      expect(result.error?.message).toBe('Email already in use');
      expect(result.user).toBeUndefined();
    });
  });

  describe('signIn', () => {
    it('signs in successfully', async () => {
      mockSignIn.mockResolvedValue({
        user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      });

      const result = await signIn('a@b.com', 'password123');
      expect(result.user).toEqual({
        uid: 'u1',
        email: 'a@b.com',
        emailVerified: true,
      });
    });

    it('returns error on failure', async () => {
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      const result = await signIn('a@b.com', 'wrong');
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signInWithGoogle', () => {
    it('signs in with Google successfully', async () => {
      mockSignInPopup.mockResolvedValue({
        user: { uid: 'g1', email: 'g@g.com', emailVerified: true },
      });

      const result = await signInWithGoogle();
      expect(result.user?.uid).toBe('g1');
    });

    it('returns error on failure', async () => {
      mockSignInPopup.mockRejectedValue(new Error('Popup closed'));

      const result = await signInWithGoogle();
      expect(result.error?.message).toBe('Popup closed');
    });
  });

  describe('logOut', () => {
    it('calls signOut', async () => {
      mockSignOut.mockResolvedValue(undefined);
      await logOut();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('resendVerificationEmail', () => {
    it('sends verification email', async () => {
      mockSendVerification.mockResolvedValue(undefined);
      const mockUser = { uid: 'u1' } as never;
      const result = await resendVerificationEmail(mockUser);
      expect(result.error).toBeUndefined();
      expect(mockSendVerification).toHaveBeenCalledWith(mockUser);
    });

    it('returns error on failure', async () => {
      mockSendVerification.mockRejectedValue(new Error('Too many requests'));
      const mockUser = { uid: 'u1' } as never;
      const result = await resendVerificationEmail(mockUser);
      expect(result.error?.message).toBe('Too many requests');
    });
  });

  describe('convertFirebaseUser', () => {
    it('converts firebase user to AuthUser', () => {
      const firebaseUser = { uid: 'u1', email: 'a@b.com', emailVerified: true } as never;
      const result = convertFirebaseUser(firebaseUser);
      expect(result).toEqual({ uid: 'u1', email: 'a@b.com', emailVerified: true });
    });

    it('returns null for null input', () => {
      const result = convertFirebaseUser(null);
      expect(result).toBeNull();
    });
  });
});
