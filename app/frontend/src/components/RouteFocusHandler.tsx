import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteFocusHandler
 * On every route change, focuses the page title referenced by main[aria-labelledby].
 * Falls back to focusing the main landmark itself.
 */
export default function RouteFocusHandler() {
  const location = useLocation();

  useEffect(() => {
    // Defer to allow DOM to paint
    const t = window.setTimeout(() => {
      try {
        const main = document.querySelector('main[aria-labelledby]') as HTMLElement | null;
        if (main) {
          const labelledby = main.getAttribute('aria-labelledby');
          if (labelledby) {
            const title = document.getElementById(labelledby) as HTMLElement | null;
            if (title) {
              if (!title.hasAttribute('tabindex')) {
                title.setAttribute('tabindex', '-1');
              }
              title.focus({ preventScroll: false });
              return;
            }
          }
          // Fallback to focusing the main region
          if (!main.hasAttribute('tabindex')) {
            main.setAttribute('tabindex', '-1');
          }
          main.focus({ preventScroll: false });
          return;
        }
        // If no main landmark, focus the first h1
        const h1 = document.querySelector('h1') as HTMLElement | null;
        if (h1) {
          if (!h1.hasAttribute('tabindex')) {
            h1.setAttribute('tabindex', '-1');
          }
          h1.focus({ preventScroll: false });
        }
      } catch {
        // noop
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
