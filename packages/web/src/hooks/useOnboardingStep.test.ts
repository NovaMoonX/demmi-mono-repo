import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingStep } from './useOnboardingStep';

describe('useOnboardingStep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('starts visible', () => {
    const { result } = renderHook(() => useOnboardingStep(0));
    expect(result.current.visible).toBe(true);
  });

  it('briefly hides and then shows when step changes', async () => {
    const { result, rerender } = renderHook(({ step }) => useOnboardingStep(step), {
      initialProps: { step: 0 },
    });

    act(() => {
      rerender({ step: 1 });
    });

    expect(result.current.visible).toBe(false);

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(result.current.visible).toBe(true);
  });
});
