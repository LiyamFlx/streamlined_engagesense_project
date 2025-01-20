import { useCallback, useState, useEffect } from 'react';
import { AudioData } from '../types/audio';

export const useBeatDetection = (audioData: AudioData | null) => {
  const [bpm, setBpm] = useState(0);
  const [beatMarkers, setBeatMarkers] = useState<number[]>([]);

  const detectBeats = useCallback((amplitude: Float32Array) => {
    const threshold = 0.15;
    const markers: number[] = [];
    
    for (let i = 1; i < amplitude.length - 1; i++) {
      if (amplitude[i] > threshold && 
          amplitude[i] > amplitude[i - 1] && 
          amplitude[i] > amplitude[i + 1]) {
        markers.push(i);
      }
    }
    
    return markers;
  }, []);

  const calculateBPM = useCallback((markers: number[]) => {
    if (markers.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < markers.length; i++) {
      intervals.push(markers[i] - markers[i - 1]);
    }
    
    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.round(60 / (averageInterval / 44100)); // Assuming 44.1kHz sample rate
  }, []);

  useEffect(() => {
    if (!audioData?.amplitude) return;

    const markers = detectBeats(audioData.amplitude);
    const detectedBPM = calculateBPM(markers);
    
    setBeatMarkers(markers);
    setBpm(detectedBPM);
  }, [audioData, detectBeats, calculateBPM]);

  return { bpm, beatMarkers };
};