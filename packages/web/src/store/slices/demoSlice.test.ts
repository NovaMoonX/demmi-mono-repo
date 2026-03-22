import reducer, { enableDemo, disableDemo } from './demoSlice';

describe('demoSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ isActive: false, isHydrated: false });
  });

  it('handles enableDemo', () => {
    const state = reducer(undefined, enableDemo());
    expect(state.isActive).toBe(true);
  });

  it('handles disableDemo', () => {
    const initial = { isActive: true, isHydrated: true };
    const state = reducer(initial, disableDemo());
    expect(state.isActive).toBe(false);
  });
});
