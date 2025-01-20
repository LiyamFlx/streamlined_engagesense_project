import { AudioData, AudioMetrics } from '../../../types/audio';
import { analyzePhysicalEngagement } from './physical';
import { analyzeEmotionalEngagement } from './emotional';
import { analyzeMentalEngagement } from './mental';
import { analyzeSpiritualEngagement } from './spiritual';

export class AudioAnalyzer {
  private readonly fftSize: number;
  private readonly smoothingTimeConstant: number;

  constructor(config = { fftSize: 2048, smoothingTimeConstant: 0.8 }) {
    this.fftSize = config.fftSize;
    this.smoothingTimeConstant = config.smoothingTimeConstant;
  }

  async analyze(audioData: AudioData): Promise<AudioMetrics> {
    if (!audioData || !audioData.frequency || !audioData.amplitude) {
      throw new Error('Invalid audio data provided');
    }

    const { frequency, amplitude } = audioData;

    const [physical, emotional, mental, spiritual] = await Promise.all([
      analyzePhysicalEngagement(amplitude),
      analyzeEmotionalEngagement(frequency),
      analyzeMentalEngagement(frequency, amplitude),
      analyzeSpiritualEngagement(frequency, amplitude)
    ]);

    return { physical, emotional, mental, spiritual };
  }
}