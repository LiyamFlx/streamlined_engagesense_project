import { useCallback, useState } from 'react';
import { AudioData } from '../types/audio';

export const useBPMDetection = () => {
  const [currentBPM, setCurrentBPM] = useState<number>(0);

  const analyzeBPM = useCallback((audioData: AudioData) => {
    const { amplitude } = audioData;
    
    // Basic BPM detection using peak detection
    const peaks = detectPeaks(amplitude);
    const bpm = calculateBPM(peaks, audioData.timeStamp);
    
    setCurrentBPM(Math.round(bpm));
    return bpm;
  }, []);

  return { currentBPM, analyzeBPM };
};

function detectPeaks(amplitude: Float32Array): number[] {
  const peaks: number[] = [];
  const threshold = 0.5;

  for (let i = 1; i < amplitude.length - 1; i++) {
    if (amplitude[i] > threshold && 
        amplitude[i] > amplitude[i - 1] && 
        amplitude[i] > amplitude[i + 1]) {
      peaks.push(i);
    }
  }

  return peaks;
}

function calculateBPM(peaks: number[], timestamp: number): number {
  if (peaks.length < 2) return 0;
  
  const averageInterval = peaks.reduce((acc, peak, i, arr) => {
    if (i === 0) return acc;
    return acc + (peak - arr[i - 1]);
  }, 0) / (peaks.length - 1);

  // Convert to BPM based on sample rate and timestamp
  const sampleRate = 44100;
  return (60 * sampleRate) / averageInterval;
}