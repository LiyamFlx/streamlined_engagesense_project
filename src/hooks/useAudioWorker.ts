import { useState, useEffect, useCallback } from 'react';
import { AudioData } from '../types/audio';

interface WorkerResult {
  features?: any;
  beats?: { beats: number[]; tempo: number };
  spectrum?: { spectrum: Float32Array };
  error?: string;
}

export const useAudioWorker = () => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audioWorker = new Worker(
      new URL('../workers/audioFeatureWorker.ts', import.meta.url),
      { type: 'module' }
    );

    audioWorker.onerror = (error) => {
      console.error('Worker error:', error);
      setError('Audio processing failed');
    };

    setWorker(audioWorker);

    return () => {
      audioWorker.terminate();
    };
  }, []);

  const processAudio = useCallback(async (
    audioData: AudioData,
    analysisType: 'ANALYZE_FEATURES' | 'DETECT_BEATS' | 'ANALYZE_SPECTRUM'
  ): Promise<WorkerResult> => {
    if (!worker) throw new Error('Worker not initialized');

    setIsProcessing(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SUCCESS') {
          resolve(event.data.data);
        } else if (event.data.type === 'ERROR') {
          reject(new Error(event.data.error));
        }
        worker.removeEventListener('message', handleMessage);
        setIsProcessing(false);
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({ audioData, type: analysisType });
    });
  }, [worker]);

  return {
    processAudio,
    isProcessing,
    error
  };
};