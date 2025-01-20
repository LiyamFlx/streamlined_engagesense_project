import * as tf from '@tensorflow/tfjs';
import { AudioData } from '../../types/audio';

interface SentimentResult {
  mood: 'positive' | 'neutral' | 'negative';
  confidence: number;
  energy: number;
  engagement: number;
}

export class SentimentAnalyzer {
  private model: tf.LayersModel | null = null;
  private readonly SAMPLE_RATE = 44100;
  private readonly FRAME_SIZE = 2048;

  async initialize(): Promise<void> {
    this.model = await this.loadModel();
  }

  async analyzeSentiment(audioData: AudioData): Promise<SentimentResult> {
    if (!this.model) throw new Error('Model not initialized');

    const features = await this.extractAudioFeatures(audioData);
    const prediction = await this.model.predict(features) as tf.Tensor;
    const [mood, confidence, energy, engagement] = await prediction.data();

    return {
      mood: this.getMoodLabel(mood),
      confidence: confidence * 100,
      energy: energy * 100,
      engagement: engagement * 100
    };
  }

  private async loadModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.conv1d({
          inputShape: [this.FRAME_SIZE, 1],
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 4, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async extractAudioFeatures(audioData: AudioData): Promise<tf.Tensor> {
    return tf.tidy(() => {
      const spectralFeatures = this.computeSpectralFeatures(audioData.frequency);
      const temporalFeatures = this.computeTemporalFeatures(audioData.amplitude);
      return tf.concat([spectralFeatures, temporalFeatures]);
    });
  }

  private computeSpectralFeatures(frequency: Float32Array): tf.Tensor {
    const spectralCentroid = this.calculateSpectralCentroid(frequency);
    const spectralRolloff = this.calculateSpectralRolloff(frequency);
    return tf.tensor2d([[spectralCentroid, spectralRolloff]]);
  }

  private computeTemporalFeatures(amplitude: Float32Array): tf.Tensor {
    const rms = this.calculateRMS(amplitude);
    const zeroCrossings = this.calculateZeroCrossings(amplitude);
    return tf.tensor2d([[rms, zeroCrossings]]);
  }

  private calculateSpectralCentroid(frequency: Float32Array): number {
    let numerator = 0;
    let denominator = 0;
    
    frequency.forEach((magnitude, i) => {
      numerator += magnitude * i;
      denominator += magnitude;
    });
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateSpectralRolloff(frequency: Float32Array): number {
    const totalEnergy = frequency.reduce((sum, val) => sum + Math.abs(val), 0);
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < frequency.length; i++) {
      cumulativeEnergy += Math.abs(frequency[i]);
      if (cumulativeEnergy >= totalEnergy * 0.85) {
        return i / frequency.length;
      }
    }
    
    return 1;
  }

  private calculateRMS(amplitude: Float32Array): number {
    return Math.sqrt(
      amplitude.reduce((acc, val) => acc + val * val, 0) / amplitude.length
    );
  }

  private calculateZeroCrossings(amplitude: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < amplitude.length; i++) {
      if ((amplitude[i] >= 0 && amplitude[i - 1] < 0) || 
          (amplitude[i] < 0 && amplitude[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings;
  }

  private getMoodLabel(prediction: number): SentimentResult['mood'] {
    if (prediction > 0.66) return 'positive';
    if (prediction > 0.33) return 'neutral';
    return 'negative';
  }
}