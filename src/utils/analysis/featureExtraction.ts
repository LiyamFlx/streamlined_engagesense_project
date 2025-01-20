import { AudioData } from '../../types/audio';
import * as Meyda from 'meyda';

export interface AudioFeatures {
  rms: number;
  spectralCentroid: number;
  pitch: number;
  silencePercentage: number;
}

export const analyzeAudioFeatures = async (audioData: AudioData): Promise<AudioFeatures> => {
  const { amplitude, frequency } = audioData;

  // Calculate RMS (volume)
  const rms = Math.sqrt(
    amplitude.reduce((acc, val) => acc + val * val, 0) / amplitude.length
  );

  // Calculate spectral centroid
  const spectralCentroid = frequency.reduce((acc, val, i) => 
    acc + val * i, 0) / frequency.reduce((acc, val) => acc + val, 0);

  // Detect pitch using autocorrelation
  const pitch = detectPitch(amplitude);

  // Calculate silence percentage
  const silenceThreshold = 0.1;
  const silentFrames = amplitude.filter(val => Math.abs(val) < silenceThreshold).length;
  const silencePercentage = (silentFrames / amplitude.length) * 100;

  return {
    rms,
    spectralCentroid,
    pitch,
    silencePercentage
  };
};

const detectPitch = (amplitude: Float32Array): number => {
  // Simple autocorrelation-based pitch detection
  const correlations = new Float32Array(amplitude.length);
  
  for (let lag = 0; lag < correlations.length; lag++) {
    let correlation = 0;
    for (let i = 0; i < correlations.length - lag; i++) {
      correlation += amplitude[i] * amplitude[i + lag];
    }
    correlations[lag] = correlation;
  }

  // Find the highest correlation peak
  let maxCorrelation = 0;
  let maxLag = 0;
  
  for (let lag = 1; lag < correlations.length; lag++) {
    if (correlations[lag] > maxCorrelation) {
      maxCorrelation = correlations[lag];
      maxLag = lag;
    }
  }

  // Convert lag to frequency (Hz)
  return maxLag > 0 ? 44100 / maxLag : 0;
};