import { useEffect } from 'react';

/**
 * Safely register and unregister a key listener on the document.
 * @param onKeyPress
 * @param keycode
 */
export const useKeyListener = (onKeyPress: (e: KeyboardEvent) => void, keycode = 'Escape') => {
  useEffect(() => {
    const eventCallback = (e) => {
      if (e.key === keycode) {
        onKeyPress(e);
      }
    };
    document.addEventListener('keydown', eventCallback);
    return () => document.removeEventListener('keydown', eventCallback);
  }, []);
};

/**
 * Register a key listener for the Escape key.
 * @param onKeyPress
 */
export const useEscapeKey = (onKeyPress: (e: KeyboardEvent) => void) => {
  useKeyListener(onKeyPress, 'Escape');
};
