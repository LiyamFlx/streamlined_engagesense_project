import { AudioFeatures } from './featureExtraction';
import { AudioMetrics } from '../../types/audio';

export interface AnalysisInsights {
  summary: string;
  recommendations: string[];
  keyMoments: {
    timestamp: number;
    type: 'peak' | 'drop' | 'breakdown';
    description: string;
  }[];
  overallScore: number;
}

export const generateInsightsReport = async (
  features: AudioFeatures,
  metrics: AudioMetrics
): Promise<AnalysisInsights> => {
  const score = calculateOverallScore(features, metrics);
  const recommendations = generateRecommendations(features, metrics);

  return {
    summary: generateSummary(features, metrics, score),
    recommendations,
    keyMoments: detectKeyMoments(features, metrics),
    overallScore: score
  };
};

const calculateOverallScore = (features: AudioFeatures, metrics: AudioMetrics): number => {
  const weights = {
    physical: 0.3,
    emotional: 0.3,
    mental: 0.2,
    spiritual: 0.2
  };

  return Math.round(
    Object.entries(weights).reduce(
      (acc, [key, weight]) => acc + metrics[key as keyof AudioMetrics] * weight,
      0
    )
  );
};

const generateSummary = (
  features: AudioFeatures,
  metrics: AudioMetrics,
  score: number
): string => {
  const energyLevel = score > 75 ? 'high' : score > 50 ? 'moderate' : 'low';
  const silenceQualifier = features.silencePercentage > 20 ? 'frequent breaks' : 'continuous energy';

  return `Session maintained ${energyLevel} engagement with ${silenceQualifier}. ` +
         `Peak emotional response at ${metrics.emotional}% with consistent mental engagement at ${metrics.mental}%.`;
};

const generateRecommendations = (
  features: AudioFeatures,
  metrics: AudioMetrics
): string[] => {
  const recommendations: string[] = [];

  if (metrics.physical < 60) {
    recommendations.push('Increase tempo and energy to boost physical engagement');
  }

  if (metrics.emotional < 70) {
    recommendations.push('Incorporate more melodic elements to enhance emotional connection');
  }

  if (features.silencePercentage > 20) {
    recommendations.push('Reduce break duration to maintain momentum');
  }

  return recommendations;
};

const detectKeyMoments = (
  features: AudioFeatures,
  metrics: AudioMetrics
): AnalysisInsights['keyMoments'] => {
  // Implementation of key moment detection
  return [];
};