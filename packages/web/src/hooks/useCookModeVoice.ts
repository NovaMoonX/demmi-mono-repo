import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceState = 'unsupported' | 'wake_word' | 'listening';

type VoiceCommand =
  | 'next'
  | 'previous'
  | 'open_ingredients'
  | 'close_ingredients'
  | 'increase_servings'
  | 'decrease_servings'
  | 'exit'
  | 'last_step'
  | 'cancel';

const WAKE_WORD_PATTERN = /hey\s+dem(?:m?[iy]|m?e{1,2}|m+i?)/i;
const COMMAND_TIMEOUT_MS = 8000;

const WORD_TO_NUMBER: Record<string, number> = {
  one: 1, first: 1,
  two: 2, second: 2,
  three: 3, third: 3,
  four: 4, fourth: 4,
  five: 5, fifth: 5,
  six: 6, sixth: 6,
  seven: 7, seventh: 7,
  eight: 8, eighth: 8,
  nine: 9, ninth: 9,
  ten: 10, tenth: 10,
  eleven: 11, eleventh: 11,
  twelve: 12, twelfth: 12,
  thirteen: 13, thirteenth: 13,
  fourteen: 14, fourteenth: 14,
  fifteen: 15, fifteenth: 15,
  sixteen: 16, sixteenth: 16,
  seventeen: 17, seventeenth: 17,
  eighteen: 18, eighteenth: 18,
  nineteen: 19, nineteenth: 19,
  twenty: 20, twentieth: 20,
};

function parseStepNumber(raw: string): number | null {
  const asInt = parseInt(raw, 10);
  if (!isNaN(asInt) && asInt > 0) return asInt;
  const fromWords = WORD_TO_NUMBER[raw.toLowerCase()];
  return fromWords ?? null;
}

function matchGoToStep(text: string): number | null {
  const t = text.toLowerCase().trim();
  const pattern =
    /\b(?:go\s+to|jump\s+to|skip\s+to|navigate\s+to)?\s*step\s+(\w+)\b/;
  const ordinalPattern = /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth)\s+step\b/;

  const m = pattern.exec(t);
  if (m) return parseStepNumber(m[1]);

  const ord = ordinalPattern.exec(t);
  if (ord) return parseStepNumber(ord[1]);

  return null;
}

function matchLastStep(text: string): boolean {
  const t = text.toLowerCase().trim();
  return /\b(?:go\s+to|jump\s+to|skip\s+to|navigate\s+to)?\s*(?:last|final)\s+step\b/.test(t);
}

function matchSetServings(text: string): number | null {
  const t = text.toLowerCase().trim();
  const pattern = /\b(\w+)\s+servings?\b/;
  const m = pattern.exec(t);
  if (m) {
    const result = parseStepNumber(m[1]);
    return result;
  }
  return null;
}

function matchCancel(text: string): boolean {
  const t = text.toLowerCase().trim();
  return /\b(cancel|nevermind|never\s+mind|nothing|stop)\b/.test(t);
}

function matchCommand(text: string): VoiceCommand | null {
  const t = text.toLowerCase().trim();

  if (/\b(next(\s+step)?|forward|continue)\b/.test(t)) return 'next';
  if (/\b((previous|prev)(\s+step)?|go\s+back|backward)\b/.test(t)) return 'previous';
  if (matchLastStep(t)) return 'last_step';
  if (matchCancel(t)) return 'cancel';
  if (/\b(open|show|see|display)\s+ingredients?\b/.test(t) || /^ingredients?\s*$/.test(t)) return 'open_ingredients';
  if (/\b(close|hide|dismiss)\s+ingredients?\b/.test(t)) return 'close_ingredients';
  if (/\b(increase|add|more)\s+(servings?|portions?)\b/.test(t)) return 'increase_servings';
  if (/\b(decrease|less|fewer|reduce|remove)\s+(servings?|portions?)\b/.test(t)) return 'decrease_servings';
  if (/\b(exit|leave|stop\s+cooking|done\s+cooking|finish\s+cooking|quit)\b/.test(t)) return 'exit';

  return null;
}

export interface UseCookModeVoiceOptions {
  enabled: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onGoToStep: (stepNumber: number) => void;
  onGoToLastStep: () => void;
  onSetServings: (servings: number) => void;
  onOpenIngredients: () => void;
  onCloseIngredients: () => void;
  onIncreaseServings: () => void;
  onDecreaseServings: () => void;
  onExit: () => void;
}

export interface UseCookModeVoiceResult {
  voiceState: VoiceState;
}

export function useCookModeVoice({
  enabled,
  onNextStep,
  onPrevStep,
  onGoToStep,
  onGoToLastStep,
  onSetServings,
  onOpenIngredients,
  onCloseIngredients,
  onIncreaseServings,
  onDecreaseServings,
  onExit,
}: UseCookModeVoiceOptions): UseCookModeVoiceResult {
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const [voiceState, setVoiceState] = useState<VoiceState>(
    isSupported ? 'wake_word' : 'unsupported',
  );

  const voiceStateRef = useRef<VoiceState>(voiceState);
  const shouldRestartRef = useRef(true);
  const commandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const callbacksRef = useRef({
    onNextStep,
    onPrevStep,
    onGoToStep,
    onGoToLastStep,
    onSetServings,
    onOpenIngredients,
    onCloseIngredients,
    onIncreaseServings,
    onDecreaseServings,
    onExit,
  });

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    callbacksRef.current = {
      onNextStep,
      onPrevStep,
      onGoToStep,
      onGoToLastStep,
      onSetServings,
      onOpenIngredients,
      onCloseIngredients,
      onIncreaseServings,
      onDecreaseServings,
      onExit,
    };
  }, [onNextStep, onPrevStep, onGoToStep, onGoToLastStep, onSetServings, onOpenIngredients, onCloseIngredients, onIncreaseServings, onDecreaseServings, onExit]);

  const exitCommandMode = useCallback(() => {
    if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
    voiceStateRef.current = 'wake_word';
    setVoiceState('wake_word');
  }, []);

  useEffect(() => {
    if (!isSupported || !enabled) return;

    type ExtendedWindow = Window & { webkitSpeechRecognition?: typeof SpeechRecognition };
    const SpeechRecognitionCtor =
      window.SpeechRecognition ??
      (window as ExtendedWindow).webkitSpeechRecognition!;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript.trim();

      if (voiceStateRef.current === 'wake_word') {
        if (WAKE_WORD_PATTERN.test(transcript)) {
          if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
          voiceStateRef.current = 'listening';
          setVoiceState('listening');
          commandTimeoutRef.current = setTimeout(() => {
            voiceStateRef.current = 'wake_word';
            setVoiceState('wake_word');
          }, COMMAND_TIMEOUT_MS);
        }
      } else if (voiceStateRef.current === 'listening' && result.isFinal) {
        const stepNumber = matchGoToStep(transcript);
        if (stepNumber !== null) {
          exitCommandMode();
          callbacksRef.current.onGoToStep(stepNumber);
          return;
        }

        const servings = matchSetServings(transcript);
        if (servings !== null) {
          exitCommandMode();
          callbacksRef.current.onSetServings(servings);
          return;
        }

        const command = matchCommand(transcript);
        if (command !== null) {
          exitCommandMode();
          switch (command) {
            case 'next':
              callbacksRef.current.onNextStep();
              break;
            case 'previous':
              callbacksRef.current.onPrevStep();
              break;
            case 'last_step':
              callbacksRef.current.onGoToLastStep();
              break;
            case 'cancel':
              break;
            case 'open_ingredients':
              callbacksRef.current.onOpenIngredients();
              break;
            case 'close_ingredients':
              callbacksRef.current.onCloseIngredients();
              break;
            case 'increase_servings':
              callbacksRef.current.onIncreaseServings();
              break;
            case 'decrease_servings':
              callbacksRef.current.onDecreaseServings();
              break;
            case 'exit':
              callbacksRef.current.onExit();
              break;
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.warn('Voice recognition error:', event.error);
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignore restart errors (e.g. already running)
        }
      }
    };

    shouldRestartRef.current = true;
    try {
      recognition.start();
    } catch {
      // Ignore start errors
    }

    return () => {
      shouldRestartRef.current = false;
      if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // Ignore
      }
    };
  }, [isSupported, enabled, exitCommandMode]);

  return { voiceState };
}

