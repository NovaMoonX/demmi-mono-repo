import { renderHook } from '@testing-library/react';
import { AuthContext, useAuth, AuthContextType } from './useAuth';

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });

  it('returns context value when inside provider', () => {
    const mockValue: AuthContextType = {
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logOut: jest.fn(),
      resendVerificationEmail: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toBe(mockValue);
    expect(result.current.user?.uid).toBe('u1');
  });
});
