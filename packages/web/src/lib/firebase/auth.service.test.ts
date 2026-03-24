import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  UserCredential,
} from 'firebase/auth';
import {
  signUp,
  signIn,
  signInWithGoogle,
  logOut,
  resendVerificationEmail,
  convertFirebaseUser,
} from './auth.service';
import { mock } from 'vitest-mock-extended';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('creates user and sends verification email', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(mock<UserCredential>({
        user: { uid: 'u1', email: 'a@b.com', emailVerified: false },
      }));
      vi.mocked(sendEmailVerification).mockResolvedValue(undefined);

      const result = await signUp('a@b.com', 'password123');
      expect(result.user).toEqual({
        uid: 'u1',
        email: 'a@b.com',
        emailVerified: false,
      });
      expect(result.error).toBeUndefined();
      expect(vi.mocked(sendEmailVerification)).toHaveBeenCalled();
    });

    it('returns error on failure', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error('Email already in use'));

      const result = await signUp('a@b.com', 'password123');
      expect(result.error?.message).toBe('Email already in use');
      expect(result.user).toBeUndefined();
    });
  });

  describe('signIn', () => {
    it('signs in successfully', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mock<UserCredential>({
        user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      }));

      const result = await signIn('a@b.com', 'password123');
      expect(result.user).toEqual({
        uid: 'u1',
        email: 'a@b.com',
        emailVerified: true,
      });
    });

    it('returns error on failure', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'));

      const result = await signIn('a@b.com', 'wrong');
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signInWithGoogle', () => {
    it('signs in with Google successfully', async () => {
      vi.mocked(signInWithPopup).mockResolvedValue(mock<UserCredential>({
        user: { uid: 'g1', email: 'g@g.com', emailVerified: true },
      }));

      const result = await signInWithGoogle();
      expect(result.user?.uid).toBe('g1');
    });

    it('returns error on failure', async () => {
      vi.mocked(signInWithPopup).mockRejectedValue(new Error('Popup closed'));

      const result = await signInWithGoogle();
      expect(result.error?.message).toBe('Popup closed');
    });
  });

  describe('logOut', () => {
    it('calls signOut', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined);
      await logOut();
      expect(vi.mocked(signOut)).toHaveBeenCalled();
    });
  });

  describe('resendVerificationEmail', () => {
    it('sends verification email', async () => {
      vi.mocked(sendEmailVerification).mockResolvedValue(undefined);
      const mockUser = { uid: 'u1' } as never;
      const result = await resendVerificationEmail(mockUser);
      expect(result.error).toBeUndefined();
      expect(vi.mocked(sendEmailVerification)).toHaveBeenCalledWith(mockUser);
    });

    it('returns error on failure', async () => {
      vi.mocked(sendEmailVerification).mockRejectedValue(new Error('Too many requests'));
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
