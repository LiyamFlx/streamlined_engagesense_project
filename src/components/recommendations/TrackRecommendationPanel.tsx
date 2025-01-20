import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { Card } from '../ui/Card';
import { TrackRecommendationItem } from './TrackRecommendationItem';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { calculateTransitionTiming, determineTransitionType, generateTransitionTips } from '../../utils/recommendations/transitionUtils';
import type { TrackRecommendation } from '../../types/audience';
import type { TransitionGuidance } from '../../utils/recommendations/transitionUtils';

interface TrackRecommendationPanelProps {
  recommendations?: TrackRecommendation[];
  isLoading?: boolean;
  error?: string | null;
  onSelectTrack: (track: TrackRecommendation) => void;
  currentTrack?: TrackRecommendation | null;
}

export const TrackRecommendationPanel: React.FC<TrackRecommendationPanelProps> = ({
  recommendations = [],
  isLoading = false,
  error = null,
  onSelectTrack,
  currentTrack
}) => {
  const { play, currentTrackId, isPlaying } = useAudioPlayer();
  const [transitionGuidance, setTransitionGuidance] = useState<TransitionGuidance | null>(null);

  const handlePlay = async (track: TrackRecommendation) => {
    if (!track.previewUrl) {
      console.warn('No preview URL available for track:', track.id);
      return;
    }

    try {
      await play(track.previewUrl, track.id);
      onSelectTrack(track);
      updateTransitionGuidance(track);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const updateTransitionGuidance = (track: TrackRecommendation) => {
    const type = determineTransitionType(track);
    const guidance: TransitionGuidance = {
      timing: calculateTransitionTiming(track),
      type,
      tips: generateTransitionTips(track, type)
    };
    
    setTransitionGuidance(guidance);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          {currentTrack ? 'Now Playing & Recommendations' : 'Recommended Tracks'}
        </h3>
        {isLoading && <LoadingSpinner size="sm" />}
      </div>

      {currentTrack && (
        <div className="mb-4 p-3 bg-purple-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">{currentTrack.title}</h4>
              <p className="text-sm text-white/70">{currentTrack.artist}</p>
            </div>
            <div className="text-sm text-purple-400">Now Playing</div>
          </div>
          {transitionGuidance && (
            <div className="mt-3 text-sm text-white/70">
              <p>Transition in: {transitionGuidance.timing}s</p>
              <ul className="mt-1 space-y-1">
                {transitionGuidance.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error ? (
        <div className="bg-red-500/20 rounded-lg p-3">
          <p className="text-white text-sm">{error}</p>
        </div>
      ) : recommendations.length === 0 && !isLoading ? (
        <div className="text-center py-6 text-white/60">
          No recommendations available yet
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.slice(0, 5).map((track) => (
            <TrackRecommendationItem
              key={track.id}
              track={track}
              isPlaying={isPlaying && currentTrackId === track.id}
              onPlay={() => handlePlay(track)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};