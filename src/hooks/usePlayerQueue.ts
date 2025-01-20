import { useState, useCallback } from 'react';
import { QueueItem } from '../types/player';

export const usePlayerQueue = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const addToQueue = useCallback((track: QueueItem) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(track => track.id !== id));
  }, []);

  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return queue[currentIndex + 1];
    }
    return null;
  }, [queue, currentIndex]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return queue[currentIndex - 1];
    }
    return null;
  }, [queue, currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  return {
    queue,
    currentTrack: currentIndex >= 0 ? queue[currentIndex] : null,
    addToQueue,
    removeFromQueue,
    playNext,
    playPrevious,
    clearQueue
  };
};