import { useEffect, useState } from 'react';
import { useTheme, Breakpoint } from '@mui/material/styles';

type QueryType = 'up' | 'down' | 'between' | 'only';

export function useMediaQuery(
  breakpoint: Breakpoint,
  type: QueryType = 'up',
  start?: Breakpoint
) {
  const theme = useTheme();
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    let query = '';

    switch (type) {
      case 'up':
        query = `(min-width: ${theme.breakpoints.values[breakpoint]}px)`;
        break;
      case 'down':
        query = `(max-width: ${theme.breakpoints.values[breakpoint] - 0.05}px)`;
        break;
      case 'between':
        if (start) {
          query = `(min-width: ${theme.breakpoints.values[start]}px) and (max-width: ${
            theme.breakpoints.values[breakpoint] - 0.05
          }px)`;
        }
        break;
      case 'only':
        const keys = Object.keys(theme.breakpoints.values) as Breakpoint[];
        const nextBreakpoint = keys[keys.indexOf(breakpoint) + 1];
        
        if (nextBreakpoint) {
          query = `(min-width: ${theme.breakpoints.values[breakpoint]}px) and (max-width: ${
            theme.breakpoints.values[nextBreakpoint] - 0.05
          }px)`;
        } else {
          query = `(min-width: ${theme.breakpoints.values[breakpoint]}px)`;
        }
        break;
    }

    if (!query) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, breakpoint, type, start]);

  return matches;
}
