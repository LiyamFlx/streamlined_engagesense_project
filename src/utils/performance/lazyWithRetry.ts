import React from 'react';

export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return React.lazy(() => 
    retry(factory, retries)
  );
}

async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft: number,
  interval: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft === 0) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
    return retry(fn, retriesLeft - 1, interval * 2);
  }
}