import React from 'react';
import { BarChart, TrendingUp, Clock, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { AudioMetrics } from '../../types/audio';

interface AnalyticsDashboardProps {
  metrics: AudioMetrics[];
  peakMoments: number;
  averageEngagement: number;
  crowdSize: number;
}

export const AdvancedAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  peakMoments,
  averageEngagement,
  crowdSize
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Real-time Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Live Metrics</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(metrics[metrics.length - 1] || {}).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70 capitalize">{key}</span>
                <span className="text-white">{value}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Peak Analysis */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Peak Analysis</h3>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-white mb-2">{peakMoments}</p>
          <p className="text-sm text-white/70">Peak Moments</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-white">{averageEngagement}%</p>
              <p className="text-xs text-white/70">Avg Engagement</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metrics.length}</p>
              <p className="text-xs text-white/70">Data Points</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Time Analysis */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Time Analysis</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Session Duration</span>
            <span className="text-white">{formatDuration(metrics.length * 5)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Peak Time</span>
            <span className="text-white">{calculatePeakTime(metrics)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Energy Sustain</span>
            <span className="text-white">{calculateEnergySustain(metrics)}%</span>
          </div>
        </div>
      </Card>

      {/* Crowd Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Crowd Insights</h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-white mb-1">{crowdSize}</p>
            <p className="text-sm text-white/70">Active Participants</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold text-white">{calculateEngagementRate(metrics)}%</p>
              <p className="text-xs text-white/70">Engagement Rate</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{calculateRetentionRate(metrics)}%</p>
              <p className="text-xs text-white/70">Retention Rate</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

const calculatePeakTime = (metrics: AudioMetrics[]): string => {
  const peakIndex = metrics.reduce((maxIndex, curr, index, arr) => 
    curr.physical > arr[maxIndex].physical ? index : maxIndex, 0);
  return `${Math.floor(peakIndex * 5 / 60)}m ${(peakIndex * 5) % 60}s`;
};

const calculateEnergySustain = (metrics: AudioMetrics[]): number => {
  const highEnergyCount = metrics.filter(m => m.physical > 70).length;
  return Math.round((highEnergyCount / metrics.length) * 100);
};

const calculateEngagementRate = (metrics: AudioMetrics[]): number => {
  return Math.round(
    metrics.reduce((sum, m) => sum + m.emotional, 0) / metrics.length
  );
};

const calculateRetentionRate = (metrics: AudioMetrics[]): number => {
  const threshold = 50;
  const retainedCount = metrics.filter(m => m.physical > threshold).length;
  return Math.round((retainedCount / metrics.length) * 100);
};