import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCookModeVoice } from './useCookModeVoice';

const defaultOptions = {
  enabled: false,
  onNextStep: vi.fn(),
  onPrevStep: vi.fn(),
  onGoToStep: vi.fn(),
  onGoToLastStep: vi.fn(),
  onSetServings: vi.fn(),
  onOpenIngredients: vi.fn(),
  onCloseIngredients: vi.fn(),
  onIncreaseServings: vi.fn(),
  onDecreaseServings: vi.fn(),
  onExit: vi.fn(),
};

describe('useCookModeVoice', () => {
  it('returns unsupported when SpeechRecognition is not available', () => {
    const { result } = renderHook(() => useCookModeVoice(defaultOptions));
    expect(result.current.voiceState).toBe('unsupported');
  });

  it('returns wake_word when SpeechRecognition is available', () => {
    const mockRecognition = {
      start: vi.fn(),
      abort: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      maxAlternatives: 1,
      onresult: null,
      onerror: null,
      onend: null,
    };
    class MockSpeechRecognition {
      start = mockRecognition.start;
      abort = mockRecognition.abort;
      continuous = mockRecognition.continuous;
      interimResults = mockRecognition.interimResults;
      lang = mockRecognition.lang;
      maxAlternatives = mockRecognition.maxAlternatives;
      onresult = mockRecognition.onresult;
      onerror = mockRecognition.onerror;
      onend = mockRecognition.onend;
    }
    Object.defineProperty(window, 'SpeechRecognition', {
      value: MockSpeechRecognition,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() =>
      useCookModeVoice({ ...defaultOptions, enabled: true }),
    );
    expect(result.current.voiceState).toBe('wake_word');

    delete (window as Record<string, unknown>).SpeechRecognition;
  });
});
