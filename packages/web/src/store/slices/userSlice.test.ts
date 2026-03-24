import { describe, it, expect } from 'vitest';
import reducer, { setUser, setLoading, clearUser } from './userSlice';

describe('userSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ user: null, loading: true });
  });

  it('handles setUser', () => {
    const user = { uid: 'u1', email: 'test@test.com', displayName: 'Test', emailVerified: true };
    const state = reducer(undefined, setUser(user));
    expect(state.user).toEqual(user);
    expect(state.loading).toBe(false);
  });

  it('handles setUser with null (sign out)', () => {
    const initial = {
      user: { uid: 'u1', email: 'test@test.com', displayName: 'Test', emailVerified: true },
      loading: false,
    };
    const state = reducer(initial, setUser(null));
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('handles setLoading', () => {
    const state = reducer(undefined, setLoading(false));
    expect(state.loading).toBe(false);
  });

  it('handles clearUser', () => {
    const initial = {
      user: { uid: 'u1', email: 'test@test.com', displayName: 'Test', emailVerified: true },
      loading: true,
    };
    const state = reducer(initial, clearUser());
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });
});
