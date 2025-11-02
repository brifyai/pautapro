import { useEffect, useCallback } from 'react';

export const useClickOutside = (ref, handler) => {
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      memoizedHandler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, memoizedHandler]);
};