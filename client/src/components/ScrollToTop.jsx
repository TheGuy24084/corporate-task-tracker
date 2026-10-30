import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures the window scroll position is reset to (0, 0)
 * on every client-side route navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable native browser scroll restoration to prevent landing mid-page
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Reset immediately
    resetScroll();

    // Reset on next frame and after mount in case of transitions
    const frameId = requestAnimationFrame(resetScroll);
    const timerId = setTimeout(resetScroll, 40);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [pathname]);

  return null;
}

