import { useCallback, useRef } from 'react';
import { throttle } from '../utils/performance/throttle';

export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit) as T,
    [limit]
  );
}