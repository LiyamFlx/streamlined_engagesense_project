import * as tf from '@tensorflow/tfjs';
import { AudioData } from '../../types/audio';
import { CrowdPrediction } from '../../types/ml';

export class CrowdAnalysisModel {
  private model: tf.LayersModel | null = null;

  async initialize() {
    // Create a sequential model for crowd analysis
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [8] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'sigmoid' })
      ]
    });

    await this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
  }

  async predictCrowdResponse(audioData: AudioData): Promise<CrowdPrediction> {
    if (!this.model) throw new Error('Model not initialized');

    const features = this.extractFeatures(audioData);
    const prediction = await this.model.predict(features) as tf.Tensor;
    const values = await prediction.data();

    return {
      energyPrediction: values[0] * 100,
      nextPeakProbability: values[1],
      genrePreference: this.interpretGenrePreference(values.slice(2)),
    };
  }

  private extractFeatures(audioData: AudioData): tf.Tensor {
    const { frequency, amplitude, metrics } = audioData;
    
    return tf.tidy(() => {
      const spectralFeatures = this.computeSpectralFeatures(frequency);
      const temporalFeatures = this.computeTemporalFeatures(amplitude);
      const metricFeatures = tf.tensor1d([
        metrics.physical / 100,
        metrics.emotional / 100,
        metrics.mental / 100,
        metrics.spiritual / 100
      ]);

      return tf.concat([spectralFeatures, temporalFeatures, metricFeatures]);
    });
  }

  private computeSpectralFeatures(frequency: Float32Array): tf.Tensor1D {
    return tf.tidy(() => {
      const freqTensor = tf.tensor1d(Array.from(frequency));
      const mean = freqTensor.mean();
      const std = freqTensor.sub(mean).square().mean().sqrt();
      return tf.stack([mean, std]);
    });
  }

  private computeTemporalFeatures(amplitude: Float32Array): tf.Tensor1D {
    return tf.tidy(() => {
      const ampTensor = tf.tensor1d(Array.from(amplitude));
      const rms = ampTensor.square().mean().sqrt();
      const zeroCrossings = this.countZeroCrossings(amplitude);
      return tf.stack([rms, tf.scalar(zeroCrossings)]);
    });
  }

  private countZeroCrossings(amplitude: Float32Array): number {
    let count = 0;
    for (let i = 1; i < amplitude.length; i++) {
      if ((amplitude[i] >= 0 && amplitude[i - 1] < 0) || 
          (amplitude[i] < 0 && amplitude[i - 1] >= 0)) {
        count++;
      }
    }
    return count;
  }

  private interpretGenrePreference(genreScores: Float32Array): string[] {
    const genres = ['house', 'techno', 'trance', 'dnb'];
    return genres
      .map((genre, i) => ({ genre, score: genreScores[i] }))
      .sort((a, b) => b.score - a.score)
      .map(({ genre }) => genre);
  }
}