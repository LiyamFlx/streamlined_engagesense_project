import { useRef, useCallback } from 'react';

interface CacheEntry {
  buffer: AudioBuffer;
  timestamp: number;
}

export const useAudioCache = (maxSize = 20, ttl = 3600000) => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const cache = useCallback(async (url: string): Promise<AudioBuffer> => {
    const cached = cacheRef.current.get(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.buffer;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    if (cacheRef.current.size >= maxSize) {
      const oldestKey = Array.from(cacheRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      cacheRef.current.delete(oldestKey);
    }

    cacheRef.current.set(url, { buffer, timestamp: Date.now() });
    return buffer;
  }, [maxSize, ttl]);

  return { cache };
};