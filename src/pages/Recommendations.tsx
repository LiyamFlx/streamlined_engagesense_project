import React from 'react';
import { TrackRecommendationPanel } from '../components/recommendations/TrackRecommendationPanel';
import { useAudioStore } from '../store/audioStore';
import { useTrackRecommendations } from '../hooks/useTrackRecommendations';
import { Card } from '../components/ui/Card';
import { Music, TrendingUp } from 'lucide-react';

const Recommendations: React.FC = () => {
  const { audioData, metrics, error } = useAudioStore();
  const { recommendations, isLoading, error: recError, currentTrack, playTrack } = useTrackRecommendations(
    audioData?.metrics ?? null,
    metrics
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Track Recommendations</h1>
      
      {error ? (
        <Card className="p-4 bg-red-500/20">
          <p className="text-white">{error.message}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recommendations */}
          <div className="lg:col-span-2">
            <TrackRecommendationPanel
              recommendations={recommendations}
              isLoading={isLoading}
              error={recError}
              currentTrack={currentTrack}
              onSelectTrack={playTrack}
            />
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-6 h-6 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Current Mood</h2>
              </div>
              
              {audioData?.metrics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-white/70">Energy</p>
                      <p className="text-xl font-semibold text-white">
                        {audioData.metrics.physical}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-white/70">Emotional</p>
                      <p className="text-xl font-semibold text-white">
                        {audioData.metrics.emotional}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/60">Start recording to see mood analysis</p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Trends</h2>
              </div>
              
              {metrics.length > 0 ? (
                <div className="space-y-3">
                  {['Energy', 'Mood', 'Engagement'].map((trend) => (
                    <div key={trend} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <p className="text-white">{trend}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">↑</span>
                          <span className="text-sm text-white/70">Rising</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">No trend data available yet</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;