import { createContext, useContext } from 'react';
import { AuthUser } from '@lib/firebase/auth.service';

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signUp: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signInWithGoogle: () => Promise<{ error?: { message: string } }>;
  logOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error?: { message: string } }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
