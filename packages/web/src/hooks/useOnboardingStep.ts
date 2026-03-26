import { useState, useEffect, useRef } from 'react';

export function useOnboardingStep(step: number) {
  const [visible, setVisible] = useState(true);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [step]);

  return { visible };
}
