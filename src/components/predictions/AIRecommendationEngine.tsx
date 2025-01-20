import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { AudioMetrics } from '../../types/audio';

interface AIRecommendation {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  action?: string;
}

interface AIRecommendationEngineProps {
  metrics: AudioMetrics;
  history: AudioMetrics[];
  onRecommendationAction?: (recommendation: AIRecommendation) => void;
}

export const AIRecommendationEngine: React.FC<AIRecommendationEngineProps> = ({
  metrics,
  history,
  onRecommendationAction
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [trend, setTrend] = useState<'rising' | 'falling' | 'stable'>('stable');

  useEffect(() => {
    analyzeMetricsAndGenerateRecommendations(metrics, history);
  }, [metrics, history]);

  const analyzeMetricsAndGenerateRecommendations = (
    currentMetrics: AudioMetrics,
    metricsHistory: AudioMetrics[]
  ) => {
    const newRecommendations: AIRecommendation[] = [];
    const energyTrend = calculateEnergyTrend(metricsHistory);
    setTrend(energyTrend);

    // Energy-based recommendations
    if (currentMetrics.physical < 40) {
      newRecommendations.push({
        id: 'energy-low',
        type: 'Energy Alert',
        message: 'Crowd energy is dropping. Consider transitioning to a higher energy track.',
        severity: 'high',
        confidence: 0.9,
        action: 'boost_energy'
      });
    }

    // Emotional engagement recommendations
    if (currentMetrics.emotional < 50 && energyTrend === 'falling') {
      newRecommendations.push({
        id: 'emotional-drop',
        type: 'Emotional Engagement',
        message: 'Emotional connection is weakening. Try incorporating more melodic elements.',
        severity: 'medium',
        confidence: 0.8,
        action: 'enhance_melody'
      });
    }

    // Mental engagement recommendations
    if (currentMetrics.mental > 80) {
      newRecommendations.push({
        id: 'mental-peak',
        type: 'Peak Engagement',
        message: 'Crowd is highly focused. Maintain this energy with similar track selection.',
        severity: 'low',
        confidence: 0.85,
        action: 'maintain_energy'
      });
    }

    setRecommendations(newRecommendations);
  };

  const calculateEnergyTrend = (history: AudioMetrics[]): 'rising' | 'falling' | 'stable' => {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-5);
    const energyChange = recent[recent.length - 1].physical - recent[0].physical;
    
    if (Math.abs(energyChange) < 5) return 'stable';
    return energyChange > 0 ? 'rising' : 'falling';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${
            trend === 'rising' ? 'text-green-400' :
            trend === 'falling' ? 'text-red-400' :
            'text-yellow-400'
          }`} />
          <span className="text-sm text-white/70 capitalize">{trend} Trend</span>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              rec.severity === 'high' ? 'bg-red-500/20' :
              rec.severity === 'medium' ? 'bg-yellow-500/20' :
              'bg-blue-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${
                rec.severity === 'high' ? 'text-red-400' :
                rec.severity === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{rec.type}</p>
                  <span className="text-sm text-white/50">
                    {Math.round(rec.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm text-white/70 mt-1">{rec.message}</p>
                {rec.action && (
                  <button
                    onClick={() => onRecommendationAction?.(rec)}
                    className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                  >
                    Apply Recommendation
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-6 text-white/50">
            No recommendations needed at this time
          </div>
        )}
      </div>
    </Card>
  );
};