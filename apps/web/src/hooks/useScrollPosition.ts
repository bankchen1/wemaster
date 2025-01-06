import { useState, useEffect } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

interface UseScrollPositionOptions {
  throttleMs?: number;
}

export function useScrollPosition({ throttleMs = 100 }: UseScrollPositionOptions = {}) {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: typeof window !== 'undefined' ? window.pageXOffset : 0,
    y: typeof window !== 'undefined' ? window.pageYOffset : 0,
  });

  useEffect(() => {
    let ticking = false;
    let lastKnownScrollPosition = scrollPosition;

    const updatePosition = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
      ticking = false;
    };

    const onScroll = () => {
      lastKnownScrollPosition = {
        x: window.pageXOffset,
        y: window.pageYOffset,
      };

      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [throttleMs]);

  return scrollPosition;
}
