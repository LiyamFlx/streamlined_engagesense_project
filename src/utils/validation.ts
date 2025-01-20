import { AudioData, AudioMetrics } from '../types/audio';

export const validateAudioData = (data: AudioData): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['timeStamp', 'frequency', 'amplitude', 'metrics'];
  return requiredFields.every(field => field in data) &&
         data.frequency instanceof Float32Array &&
         data.amplitude instanceof Float32Array &&
         validateMetrics(data.metrics);
};

export const validateMetrics = (metrics: AudioMetrics): boolean => {
  if (!metrics || typeof metrics !== 'object') return false;
  
  const requiredMetrics = ['physical', 'emotional', 'mental', 'spiritual'];
  return requiredMetrics.every(metric => 
    metric in metrics && 
    typeof metrics[metric as keyof AudioMetrics] === 'number' &&
    metrics[metric as keyof AudioMetrics] >= 0 &&
    metrics[metric as keyof AudioMetrics] <= 100
  );
};

export const validateAudioContext = (context: AudioContext): boolean => {
  return context.state !== 'closed' && 
         typeof context.sampleRate === 'number' &&
         context.sampleRate > 0;