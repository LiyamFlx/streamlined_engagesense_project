import { AudioData } from '../types/audio';

const ctx: Worker = self as any;

// Handle messages from main thread
ctx.addEventListener('message', async (event) => {
  const { audioData, type } = event.data;
  
  try {
    let result;
    switch (type) {
      case 'ANALYZE_FEATURES':
        result = await analyzeAudioFeatures(audioData);
        break;
      case 'DETECT_BEATS':
        result = await detectBeats(audioData);
        break;
      case 'ANALYZE_SPECTRUM':
        result = await analyzeSpectrum(audioData);
        break;
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
    
    ctx.postMessage({ type: 'SUCCESS', data: result });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: error.message });
  }
});

// Audio analysis functions
async function analyzeAudioFeatures(audioData: AudioData) {
  const { frequency, amplitude } = audioData;
  
  return {
    rms: calculateRMS(amplitude),
    spectralCentroid: calculateSpectralCentroid(frequency),
    zeroCrossings: calculateZeroCrossings(amplitude),
    spectralFlux: calculateSpectralFlux(frequency)
  };
}

async function detectBeats(audioData: AudioData) {
  const { amplitude } = audioData;
  const threshold = 0.15;
  const beats = [];
  
  for (let i = 1; i < amplitude.length - 1; i++) {
    if (amplitude[i] > threshold && 
        amplitude[i] > amplitude[i - 1] && 
        amplitude[i] > amplitude[i + 1]) {
      beats.push(i);
    }
  }
  
  return { beats, tempo: calculateTempo(beats) };
}

async function analyzeSpectrum(audioData: AudioData) {
  const { frequency } = audioData;
  const bands = 8;
  const spectrum = new Float32Array(bands);
  const bandWidth = Math.floor(frequency.length / bands);
  
  for (let i = 0; i < bands; i++) {
    const start = i * bandWidth;
    const end = start + bandWidth;
    spectrum[i] = calculateBandEnergy(frequency.slice(start, end));
  }
  
  return { spectrum };
}

// Helper functions
function calculateRMS(amplitude: Float32Array): number {
  return Math.sqrt(
    amplitude.reduce((acc, val) => acc + val * val, 0) / amplitude.length
  );
}

function calculateSpectralCentroid(frequency: Float32Array): number {
  let numerator = 0;
  let denominator = 0;
  
  frequency.forEach((magnitude, i) => {
    numerator += magnitude * i;
    denominator += magnitude;
  });
  
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateZeroCrossings(amplitude: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < amplitude.length; i++) {
    if ((amplitude[i] >= 0 && amplitude[i - 1] < 0) || 
        (amplitude[i] < 0 && amplitude[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings;
}

function calculateSpectralFlux(frequency: Float32Array): number {
  let flux = 0;
  for (let i = 1; i < frequency.length; i++) {
    flux += Math.pow(frequency[i] - frequency[i - 1], 2);
  }
  return Math.sqrt(flux);
}

function calculateBandEnergy(band: Float32Array): number {
  return band.reduce((acc, val) => acc + Math.abs(val), 0) / band.length;
}

function calculateTempo(beats: number[]): number {
  if (beats.length < 2) return 0;
  
  const intervals = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i] - beats[i - 1]);
  }
  
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return Math.round(60 / (averageInterval / 44100)); // Assuming 44.1kHz sample rate
}