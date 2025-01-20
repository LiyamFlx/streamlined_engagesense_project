import { useState, useEffect } from 'react';
import { AudioMetrics } from '../types/audio';
import { TrackRecommendation } from '../types/audience';
import { TrackAnalyzer } from '../utils/recommendations/trackAnalyzer';

export const useTrackRecommendations = (
  currentMetrics: AudioMetrics | null,
  history: AudioMetrics[],
  currentBPM: number = 128
): { 
  recommendations: TrackRecommendation[];
  currentTrack: TrackRecommendation | null;
  isLoading: boolean;
  error: string | null;
  playTrack: (track: TrackRecommendation) => void;
} => {
  const [recommendations, setRecommendations] = useState<TrackRecommendation[]>([]);
  const [currentTrack, setCurrentTrack] = useState<TrackRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzer = new TrackAnalyzer();

  useEffect(() => {
    if (!currentMetrics || !Array.isArray(history)) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const factors = analyzer.analyzeCurrentState(currentMetrics, history, currentBPM);
      
      // Get tracks based on current analysis
      const availableTracks = getMockTracks();
      
      // Score and sort tracks
      const scoredTracks = availableTracks
        .map(track => ({
          ...track,
          confidence: analyzer.calculateTrackScore(track, factors),
          transitionType: factors.transitionType
        }))
        .sort((a, b) => {
          return b.confidence - a.confidence;
        });

      setRecommendations(scoredTracks);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      console.error('Recommendation error:', err);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentMetrics, history, currentBPM]);

  const playTrack = (track: TrackRecommendation) => {
    setCurrentTrack(track);
    if (track.previewUrl) {
      const audio = new Audio(track.previewUrl);
      audio.play().catch(console.error);
    }
  };

  return { recommendations, currentTrack, isLoading, error, playTrack };
};

// Mock function to simulate available tracks
function getMockTracks(): TrackRecommendation[] {
  return [
    {
      id: '1',
      title: 'Energy Flow',
      artist: 'DJ Pulse',
      bpm: 128,
      energy: 85,
      genre: 'House',
      confidence: 0,
      reason: 'Perfect energy match',
      previewUrl: 'https://example.com/preview1.mp3'
    },
    {
      id: '2',
      title: 'Techno Dreams',
      artist: 'Beat Master',
      bpm: 130,
      energy: 90,
      genre: 'Techno',
      confidence: 0,
      reason: 'High energy progression',
      previewUrl: 'https://example.com/preview2.mp3'
    },
    // Add more mock tracks as needed
  ];
}