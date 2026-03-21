import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import { auth } from '@lib/firebase/firebase.config';

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

export async function signUp(
  email: string,
  password: string,
): Promise<{ user?: AuthUser; error?: { message: string } }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(result.user);
    
    const user: AuthUser = {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified,
    };
    
    return { user };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create account';
    return {
      error: {
        message,
      },
    };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user?: AuthUser; error?: { message: string } }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    const user: AuthUser = {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified,
    };
    
    return { user };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sign in';
    return {
      error: {
        message,
      },
    };
  }
}

export async function signInWithGoogle(): Promise<{
  user?: AuthUser;
  error?: { message: string };
}> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user: AuthUser = {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified,
    };

    return { user };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to sign in with Google';
    return {
      error: {
        message,
      },
    };
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function resendVerificationEmail(
  user: User,
): Promise<{ error?: { message: string } }> {
  try {
    await sendEmailVerification(user);
    return {};
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to send verification email';
    return {
      error: {
        message,
      },
    };
  }
}

export function convertFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}
