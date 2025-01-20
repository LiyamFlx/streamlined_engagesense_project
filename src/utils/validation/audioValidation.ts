import { AudioData, AudioMetrics } from '../../types/audio';

export class AudioValidator {
  static validateAudioData(data: AudioData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!data) {
      errors.push('Audio data is required');
      return { valid: false, errors };
    }

    // Validate timestamp
    if (!data.timeStamp || typeof data.timeStamp !== 'number') {
      errors.push('Invalid timestamp');
    }

    // Validate frequency data
    if (!(data.frequency instanceof Float32Array) || data.frequency.length === 0) {
      errors.push('Invalid frequency data');
    }

    // Validate amplitude data
    if (!(data.amplitude instanceof Float32Array) || data.amplitude.length === 0) {
      errors.push('Invalid amplitude data');
    }

    // Validate metrics
    if (!this.validateMetrics(data.metrics)) {
      errors.push('Invalid metrics data');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateMetrics(metrics: AudioMetrics): boolean {
    if (!metrics) return false;

    const requiredMetrics = ['physical', 'emotional', 'mental', 'spiritual'];
    
    return requiredMetrics.every(metric => {
      const value = metrics[metric as keyof AudioMetrics];
      return (
        typeof value === 'number' &&
        !isNaN(value) &&
        value >= 0 &&
        value <= 100
      );
    });
  }

  static validateAudioContext(context: AudioContext): boolean {
    return (
      context.state !== 'closed' &&
      typeof context.sampleRate === 'number' &&
      context.sampleRate > 0
    );
  }
}