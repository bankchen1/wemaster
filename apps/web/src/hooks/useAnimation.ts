import { useEffect, useState } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useMediaQuery } from './useMediaQuery';

interface UseAnimationProps {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disableOnMobile?: boolean;
}

export function useAnimation({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  disableOnMobile = true,
}: UseAnimationProps = {}) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const isMobile = useMediaQuery('sm', 'down');
  
  const { ref, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: triggerOnce,
  });

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  const shouldAnimate = (!disableOnMobile || !isMobile) && (isVisible || hasAnimated);

  return {
    ref,
    isVisible: shouldAnimate,
    hasAnimated,
  };
}
