import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioMetrics } from '../types/audio';
import { analyzePhysicalEngagement } from '../utils/audio/analysis/physical';
import { analyzeEmotionalEngagement } from '../utils/audio/analysis/emotional';
import { analyzeMentalEngagement } from '../utils/audio/analysis/mental';
import { analyzeSpiritualEngagement } from '../utils/audio/analysis/spiritual';

const ANALYSIS_BUFFER_SIZE = 2048;

export const useAudioAnalysis = () => {
  const [metrics, setMetrics] = useState<AudioMetrics | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeAudioData = useCallback((frequency: Float32Array, amplitude: Float32Array) => {
    // Clear any pending analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Initialize Web Worker if needed
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/audioProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        if (event.data.type === 'SUCCESS') {
          setMetrics(event.data.data);
        } else if (event.data.type === 'ERROR') {
          console.error('Audio analysis failed:', event.data.error);
        }
      };
    }

    // Debounce analysis to prevent too frequent updates
    analysisTimeoutRef.current = setTimeout(() => {
      workerRef.current?.postMessage({
        frequency: Array.from(frequency),
        amplitude: Array.from(amplitude)
      });
    }, 100);

    return metrics;
  }, [metrics]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    metrics,
    analyzeAudioData,
  };
};