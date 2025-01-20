import { TrackRecommendation } from '../types/audience';
import { AudioMetrics } from '../types/audio';

export const analyzeEnergyTrend = (history: AudioMetrics[]): 'rising' | 'falling' | 'stable' => {
  if (history.length < 2) return 'stable';

  const recent = history.slice(-5);
  const energyChange = recent[recent.length - 1].physical - recent[0].physical;

  if (Math.abs(energyChange) < 5) return 'stable';
  return energyChange > 0 ? 'rising' : 'falling';
};

export const calculateTargetEnergy = (currentEnergy: number, trend: string): number => {
  switch (trend) {
    case 'rising':
      return Math.min(currentEnergy + 10, 100);
    case 'falling':
      return Math.min(currentEnergy + 20, 100);
    default:
      return currentEnergy;
  }
};

export const getRecommendations = (
  currentMetrics: AudioMetrics,
  history: AudioMetrics[]
): TrackRecommendation[] => {
  const trend = analyzeEnergyTrend(history);
  const targetEnergy = calculateTargetEnergy(currentMetrics.physical, trend);

  return [
    {
      id: '1',
      title: 'Energy Flow',
      artist: 'DJ Pulse',
      bpm: 128,
      energy: targetEnergy,
      genre: 'House',
      confidence: 0.85,
      reason: `Matches current energy level (${targetEnergy}%) with ${trend} trend`,
      previewUrl: 'https://example.com/preview1.mp3'
    },
    {
      id: '2',
      title: 'Crowd Mover',
      artist: 'Beat Master',
      bpm: 130,
      energy: targetEnergy + 5,
      genre: 'Tech House',
      confidence: 0.75,
      reason: 'Maintains momentum with slight energy increase',
      previewUrl: 'https://example.com/preview2.mp3'
    },
    {
      id: '3',
      title: 'Deep Groove',
      artist: 'Rhythm Collective',
      bpm: 126,
      energy: targetEnergy - 5,
      genre: 'Deep House',
      confidence: 0.7,
      reason: 'Provides smooth energy transition',
      previewUrl: 'https://example.com/preview3.mp3'
    }
  ];
};