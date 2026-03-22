import { renderHook, act } from '@testing-library/react';
import { useIsMobileDevice } from './useIsMobileDevice';

describe('useIsMobileDevice', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('returns false for desktop-width windows', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobileDevice());
    expect(result.current).toBe(false);
  });

  it('returns true when media query matches mobile width', () => {
    const matchMediaListeners: Array<() => void> = [];
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((_: string, cb: () => void) => matchMediaListeners.push(cb)),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() => useIsMobileDevice());
    expect(result.current).toBe(true);
  });

  it('responds to media query changes', () => {
    const matchMediaListeners: Array<() => void> = [];
    let currentMatches = false;

    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      get matches() { return currentMatches; },
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((_: string, cb: () => void) => matchMediaListeners.push(cb)),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useIsMobileDevice());
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      matchMediaListeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
  });
});
