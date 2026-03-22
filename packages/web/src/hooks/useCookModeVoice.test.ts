import { renderHook } from '@testing-library/react';
import { useCookModeVoice } from './useCookModeVoice';

const defaultOptions = {
  enabled: false,
  onNextStep: jest.fn(),
  onPrevStep: jest.fn(),
  onGoToStep: jest.fn(),
  onGoToLastStep: jest.fn(),
  onSetServings: jest.fn(),
  onOpenIngredients: jest.fn(),
  onCloseIngredients: jest.fn(),
  onIncreaseServings: jest.fn(),
  onDecreaseServings: jest.fn(),
  onExit: jest.fn(),
};

describe('useCookModeVoice', () => {
  it('returns unsupported when SpeechRecognition is not available', () => {
    const { result } = renderHook(() => useCookModeVoice(defaultOptions));
    expect(result.current.voiceState).toBe('unsupported');
  });

  it('returns wake_word when SpeechRecognition is available', () => {
    const mockRecognition = {
      start: jest.fn(),
      abort: jest.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      maxAlternatives: 1,
      onresult: null,
      onerror: null,
      onend: null,
    };
    const MockSpeechRecognition = jest.fn(() => mockRecognition);
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
