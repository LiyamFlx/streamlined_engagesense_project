import { AudioData, AudioMetrics } from '../../types/audio';
import { AUDIO_CONSTANTS } from '../constants';
import { validateAudioData } from '../validation';
import { AudioProcessingError } from '../error/errorHandling';

export const processAudioData = (
  frequency: Float32Array,
  amplitude: Float32Array
): AudioData => {
  if (!frequency || !amplitude) {
    throw new AudioProcessingError(
      'Invalid audio data provided',
      'INVALID_AUDIO_DATA'
    );
  }

  const metrics = calculateMetrics(frequency, amplitude);
  const audioData: AudioData = {
    timeStamp: Date.now(),
    frequency,
    amplitude,
    metrics
  };

  if (!validateAudioData(audioData)) {
    throw new AudioProcessingError(
      'Audio data validation failed',
      'INVALID_AUDIO_DATA'
    );
  }

  return audioData;
};

const calculateMetrics = (
  frequency: Float32Array,
  amplitude: Float32Array
): AudioMetrics => {
  return {
    physical: calculatePhysicalMetrics(amplitude),
    emotional: calculateEmotionalMetrics(frequency),
    mental: calculateMentalMetrics(frequency, amplitude),
    spiritual: calculateSpiritualMetrics(frequency)
  };
};

const calculatePhysicalMetrics = (amplitude: Float32Array): number => {
  const rms = Math.sqrt(
    amplitude.reduce((acc, val) => acc + val * val, 0) / amplitude.length
  );
  return Math.min(Math.round(rms * 100), 100);
};

const calculateEmotionalMetrics = (frequency: Float32Array): number => {
  const emotionalResponse = frequency.reduce((acc, val) => acc + Math.abs(val), 0);
  return Math.min(Math.round(emotionalResponse * 100), 100);
};

const calculateMentalMetrics = (
  frequency: Float32Array,
  amplitude: Float32Array
): number => {
  const complexity = calculateSpectralComplexity(frequency);
  const stability = calculateRhythmicStability(amplitude);
  return Math.round((complexity + stability) / 2);
};

const calculateSpiritualMetrics = (frequency: Float32Array): number => {
  const harmonicContent = calculateHarmonicContent(frequency);
  return Math.min(Math.round(harmonicContent * 100), 100);
};

const calculateSpectralComplexity = (frequency: Float32Array): number => {
  const mean = frequency.reduce((acc, val) => acc + val, 0) / frequency.length;
  const variance = frequency.reduce((acc, val) => 
    acc + Math.pow(val - mean, 2), 0
  ) / frequency.length;
  
  return Math.sqrt(variance);
};

const calculateRhythmicStability = (amplitude: Float32Array): number => {
  const windowSize = 64;
  let stability = 0;
  
  for (let i = 0; i < amplitude.length - windowSize; i++) {
    const correlation = calculateCorrelation(
      amplitude.slice(i, i + windowSize),
      amplitude.slice(i + windowSize, i + windowSize * 2)
    );
    stability += correlation;
  }
  
  return Math.min(Math.abs(stability), 100);
};

const calculateHarmonicContent = (frequency: Float32Array): number => {
  const fundamentalFreq = findFundamentalFrequency(frequency);
  let harmonicScore = 0;
  
  for (let i = 2; i <= 8; i++) {
    const harmonicIdx = fundamentalFreq * i;
    if (harmonicIdx < frequency.length) {
      harmonicScore += Math.abs(frequency[harmonicIdx]);
    }
  }
  
  return harmonicScore;
};

const calculateCorrelation = (a: Float32Array, b: Float32Array): number => {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  
  for (let i = 0; i < n; i++) {
    sum += a[i] * b[i];
  }
  
  return sum / n;
};

const findFundamentalFrequency = (frequency: Float32Array): number => {
  let maxIndex = 0;
  let maxValue = -Infinity;
  
  for (let i = 0; i < frequency.length / 4; i++) {
    if (frequency[i] > maxValue) {
      maxValue = frequency[i];
      maxIndex = i;
    }
  }
  
  return maxIndex;
};