import React, { useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { usePlayerQueue } from '../../hooks/usePlayerQueue';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { QueueItem, PlayerAnalytics } from '../../types/player';

interface TrackRecommendationPlayerProps {
  recommendations: QueueItem[];
  analytics?: PlayerAnalytics;
  className?: string;
}

export const TrackRecommendationPlayer: React.FC<TrackRecommendationPlayerProps> = ({
  recommendations,
  analytics,
  className = ''
}) => {
  const { play, stop, isPlaying, currentTrackId, progress, error } = useAudioPlayer();
  const { queue, currentTrack, addToQueue, playNext, playPrevious } = usePlayerQueue();

  useEffect(() => {
    recommendations.forEach(track => addToQueue(track));
  }, [recommendations, addToQueue]);

  const handlePlay = async (track: QueueItem) => {
    try {
      await play(track.url, track.id);
      analytics?.trackStarted(track);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Playback failed');
      analytics?.errorOccurred(error);
    }
  };

  const handleNext = async () => {
    const nextTrack = playNext();
    if (nextTrack) {
      if (currentTrack) {
        analytics?.trackSkipped(currentTrack);
      }
      await handlePlay(nextTrack);
    }
  };

  const handlePrevious = async () => {
    const prevTrack = playPrevious();
    if (prevTrack) {
      if (currentTrack) {
        analytics?.trackSkipped(currentTrack);
      }
      await handlePlay(prevTrack);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      {/* Now Playing */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Now Playing</h3>
        {currentTrack ? (
          <div className="mt-2">
            <p className="text-white font-medium">{currentTrack.title}</p>
            <p className="text-white/70 text-sm">{currentTrack.artist}</p>
          </div>
        ) : (
          <p className="text-white/60">No track selected</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={SkipBack}
            onClick={handlePrevious}
            disabled={!currentTrack}
          />
          <Button
            variant="primary"
            size="md"
            icon={isPlaying ? Pause : Play}
            onClick={() => currentTrack && handlePlay(currentTrack)}
            disabled={!currentTrack}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={SkipForward}
            onClick={handleNext}
            disabled={!currentTrack}
          />
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          icon={Volume2}
          className="opacity-50"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-2 bg-red-500/20 rounded text-sm text-white">
          {error.message}
        </div>
      )}
    </Card>
  );
};