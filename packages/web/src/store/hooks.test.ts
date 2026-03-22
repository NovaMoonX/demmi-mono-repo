import { useAppDispatch, useAppSelector } from './hooks';

describe('store hooks', () => {
  it('exports useAppDispatch', () => {
    expect(useAppDispatch).toBeDefined();
    expect(typeof useAppDispatch).toBe('function');
  });

  it('exports useAppSelector', () => {
    expect(useAppSelector).toBeDefined();
    expect(typeof useAppSelector).toBe('function');
  });
});
