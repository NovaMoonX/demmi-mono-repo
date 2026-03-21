import { useEffect, useState } from 'react';

const MOBILE_MAX_WIDTH = 767;

const getIsMobileDevice = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const result = window.innerWidth <= MOBILE_MAX_WIDTH;
  return result;
};

export function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(() => getIsMobileDevice());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);

    const updateIsMobile = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobile(nextIsMobile);
    };

    updateIsMobile();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateIsMobile);
    } else {
      window.addEventListener('resize', updateIsMobile);
    }

    const cleanup = () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateIsMobile);
      } else {
        window.removeEventListener('resize', updateIsMobile);
      }
    };

    return cleanup;
  }, []);

  return isMobile;
}
