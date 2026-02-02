import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : type === 'heavy' ? 40 : 10;
      navigator.vibrate(duration);
    }
  }, []);

  return { triggerHaptic };
};
