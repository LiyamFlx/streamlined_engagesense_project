export const analyzeEmotionalEngagement = (frequency: Float32Array): number => {
  const totalEnergy = frequency.reduce((acc, val) => acc + Math.abs(val), 0);
  const normalizedEnergy = totalEnergy / frequency.length;

  // Enhanced emotional analysis using multiple factors
  const spectralCentroid = calculateSpectralCentroid(frequency);
  const spectralFlux = calculateSpectralFlux(frequency);
  const spectralRolloff = calculateSpectralRolloff(frequency);

  // Weight and combine features for better emotional detection
  const emotionalScore = (
    normalizedEnergy * 0.4 +
    spectralCentroid * 0.3 +
    spectralFlux * 0.2 +
    spectralRolloff * 0.1
  ) * 100;

  return Math.min(Math.round(emotionalScore), 100);
};

const calculateSpectralCentroid = (frequency: Float32Array): number => {
  let numerator = 0;
  let denominator = 0;

  frequency.forEach((magnitude, i) => {
    numerator += magnitude * i;
    denominator += magnitude;
  });

  return denominator === 0 ? 0 : numerator / denominator / frequency.length;
};

const calculateSpectralFlux = (frequency: Float32Array): number => {
  let flux = 0;
  for (let i = 1; i < frequency.length; i++) {
    flux += Math.pow(frequency[i] - frequency[i - 1], 2);
  }
  return Math.sqrt(flux) / frequency.length;
};

const calculateSpectralRolloff = (frequency: Float32Array): number => {
  const totalEnergy = frequency.reduce((sum, val) => sum + Math.abs(val), 0);
  let cumulativeEnergy = 0;

  for (let i = 0; i < frequency.length; i++) {
    cumulativeEnergy += Math.abs(frequency[i]);
    if (cumulativeEnergy >= totalEnergy * 0.85) {
      return i / frequency.length;
    }
  }
  return 1;
};