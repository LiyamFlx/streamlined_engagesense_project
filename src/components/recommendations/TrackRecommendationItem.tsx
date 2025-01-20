import React from 'react';
import { Play, Pause, TrendingUp } from 'lucide-react';
import { TrackRecommendation } from '../../types/audience';

interface TrackRecommendationItemProps {
  track: TrackRecommendation;
  isPlaying: boolean;
  onPlay: () => void;
}

export const TrackRecommendationItem: React.FC<TrackRecommendationItemProps> = ({
  track,
  isPlaying,
  onPlay
}) => {
  const handlePlay = () => {
    if (!track.previewUrl) {
      console.warn('No preview URL available for track:', track.id);
      return;
    }
    onPlay();
  };

  return (
    <div
      role="button"
      aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
      className="w-full hover:bg-white/5 rounded-lg p-3 sm:p-4 transition-all duration-200 text-left group"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              disabled={!track.previewUrl}
              className={`p-2 rounded-full ${
                isPlaying ? 'bg-purple-500/20' : 'bg-white/10'
              } hover:bg-white/20 transition-all duration-200
                min-w-[2.5rem] min-h-[2.5rem]
                disabled:opacity-50 disabled:cursor-not-allowed
                group-hover:scale-110`}
              aria-label={isPlaying ? 'Pause track' : 'Play track'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-purple-400 mx-auto" />
              ) : (
                <Play className="h-4 w-4 text-white mx-auto" />
              )}
            </button>
            <div>
              <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors text-sm sm:text-base line-clamp-1">{track.title}</h4>
              <p className="text-xs sm:text-sm text-white/70 line-clamp-1">{track.artist}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs sm:text-sm text-white/70">{track.bpm} BPM</div>
          <div className="flex items-center gap-1 text-[0.65rem] sm:text-xs text-purple-400">
            <TrendingUp className="w-3 h-3" />
            {Math.round(track.confidence * 100)}% match
          </div>
        </div>
      </div>
      <p className="text-[0.65rem] sm:text-xs text-white/50 mt-2 group-hover:text-white/70 transition-colors line-clamp-2">{track.reason}</p>
    </div>
  );
};