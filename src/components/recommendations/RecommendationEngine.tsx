import React, { useEffect, useState } from 'react';
import { TrackScoring } from '../../utils/recommendations/scoring';
import { ContextAnalyzer } from '../../utils/recommendations/contextAnalyzer';
import { Card } from '../ui/Card';
import { TrackRecommendationItem } from './TrackRecommendationItem';
import { Button } from '../ui/Button';
import { Sliders, Music } from 'lucide-react';
import type { TrackRecommendation } from '../../types/audience';

interface RecommendationEngineProps {
  currentTrack: TrackRecommendation | null;
  crowdMetrics: { energy: number; mood: string };
  onTrackSelect: (track: TrackRecommendation) => void;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  currentTrack,
  crowdMetrics,
  onTrackSelect
}) => {
  const [preferences, setPreferences] = useState({
    genres: ['House', 'Techno', 'Trance'],
    energy: 0.7
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const scoring = new TrackScoring();
  const analyzer = new ContextAnalyzer();

  const [recommendations, setRecommendations] = useState<TrackRecommendation[]>([]);

  useEffect(() => {
    const context = analyzer.analyzeContext(
      currentTrack,
      [], // Recent tracks would come from history
      crowdMetrics,
      preferences
    );

    // This would normally fetch from your track database
    const availableTracks: TrackRecommendation[] = [
      {
        id: '1',
        title: 'Energy Flow',
        artist: 'DJ Pulse',
        bpm: 128,
        energy: 85,
        genre: 'House',
        confidence: 0.9,
        reason: 'Matches current energy and crowd mood'
      },
      // Add more mock tracks
    ];

    const scoredTracks = availableTracks
      .map(track => ({
        ...track,
        confidence: scoring.calculateScore(track, context).final
      }))
      .sort((a, b) => b.confidence - a.confidence);

    setRecommendations(scoredTracks);
  }, [currentTrack, crowdMetrics, preferences]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          Smart Recommendations
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">
            Crowd Energy: {Math.round(crowdMetrics.energy)}%
          </span>
        <Button
          variant="secondary"
          icon={Sliders}
          onClick={() => setShowPreferences(!showPreferences)}
          aria-expanded={showPreferences}
          aria-label="Customize recommendations"
          />
        </div>
      </div>

      {currentTrack && (
        <div className="mb-4 p-4 bg-purple-500/20 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-white">{currentTrack.title}</h3>
              <p className="text-sm text-white/70">{currentTrack.artist}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">{currentTrack.bpm} BPM</div>
              <div className="text-xs text-purple-400">Now Playing</div>
            </div>
          </div>
        </div>
      )}
      {showPreferences && (
        <div className="mb-4 p-4 bg-black/20 rounded-lg animate-slide-up">
          <h3 className="text-sm font-medium text-white mb-2">Energy Preference</h3>
          <input
            type="range"
            min="0"
            max="100"
            value={preferences.energy * 100}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              energy: Number(e.target.value) / 100
            }))}
            className="w-full accent-purple-500"
            aria-label="Energy level preference"
          />
          
          <h3 className="text-sm font-medium text-white mt-4 mb-2">Preferred Genres</h3>
          <div className="flex flex-wrap gap-2">
            {['House', 'Techno', 'Trance', 'Progressive'].map(genre => (
              <button
                key={genre}
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  genres: prev.genres.includes(genre)
                    ? prev.genres.filter(g => g !== genre)
                    : [...prev.genres, genre]
                }))}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  preferences.genres.includes(genre)
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                aria-pressed={preferences.genres.includes(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 divide-y divide-white/10">
        {recommendations.map(track => (
          <TrackRecommendationItem
            key={track.id}
            track={track}
            isPlaying={false}
            onPlay={() => onTrackSelect(track)}
          />
        ))}
      </div>
    </Card>
  );
};