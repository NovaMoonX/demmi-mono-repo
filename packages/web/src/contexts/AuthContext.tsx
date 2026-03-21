import { ReactNode, useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '@lib/firebase/firebase.config';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signInWithGoogle as authSignInWithGoogle,
  logOut as authLogOut,
  resendVerificationEmail as authResendVerificationEmail,
  convertFirebaseUser,
  AuthUser,
} from '@lib/firebase/auth.service';
import { AuthContext } from '@hooks/useAuth';
import { useAppDispatch } from '@store/hooks';
import { endDemoSessionIfActive, clearUserDataUnlessDemo } from '@store/slices/demoSlice';
import {
  loadUserData,
  setLoading as setUserLoading,
  setUser as setStoreUser,
} from '@store/slices/userSlice';

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [user, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setAuthLoading] = useState(true);

  const updateAuthUser = useCallback((nextUser: AuthUser | null) => {
    setAuthUser(nextUser);
    dispatch(setStoreUser(nextUser));
  }, [dispatch]);

  const updateAuthLoading = useCallback((nextLoading: boolean) => {
    setAuthLoading(nextLoading);
    dispatch(setUserLoading(nextLoading));
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      const authUser = convertFirebaseUser(firebaseUser);
      updateAuthUser(authUser);

      if (authUser != null) {
        await dispatch(endDemoSessionIfActive());
        await dispatch(loadUserData());
      } else {
        await dispatch(clearUserDataUnlessDemo());
      }

      updateAuthLoading(false);
    });

    return unsubscribe;
  }, [dispatch, updateAuthLoading, updateAuthUser]);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error?: { message: string } }> => {
    updateAuthLoading(true);
    const result = await authSignIn(email, password);
    
    if (result.error) {
      updateAuthLoading(false);
    }
    
    return result.error ? { error: result.error } : {};
  };

  const signUp = async (
    email: string,
    password: string,
  ): Promise<{ error?: { message: string } }> => {
    updateAuthLoading(true);
    const result = await authSignUp(email, password);
    
    if (result.error) {
      updateAuthLoading(false);
    }
    
    return result.error ? { error: result.error } : {};
  };

  const signInWithGoogle = async (): Promise<{ error?: { message: string } }> => {
    updateAuthLoading(true);
    const result = await authSignInWithGoogle();

    if (result.error) {
      updateAuthLoading(false);
    }

    return result.error ? { error: result.error } : {};
  };

  const logOut = async (): Promise<void> => {
    updateAuthLoading(true);
    await authLogOut();
  };

  const resendVerificationEmail = async (): Promise<{
    error?: { message: string };
  }> => {
    if (!firebaseAuth.currentUser) {
      return { error: { message: 'No user logged in' } };
    }
    
    return await authResendVerificationEmail(firebaseAuth.currentUser);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logOut,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
