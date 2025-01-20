import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Settings, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrottleCallback } from '../../hooks/useThrottleCallback';

interface EngagementMetrics {
  applauseIntensity: number;
  movementLevel: number;
  noiseLevel: number;
  facialExpression: number;
  socialSentiment: number;
}

interface EngagementWeights {
  applauseIntensity: number;
  movementLevel: number;
  noiseLevel: number;
  facialExpression: number;
  socialSentiment: number;
}
export const CrowdEngagementScore: React.FC = () => {
  const [score, setScore] = useState(0);
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    applauseIntensity: 0,
    movementLevel: 0,
    noiseLevel: 0,
    facialExpression: 0,
    socialSentiment: 0
  });
  const [weights, setWeights] = useState<EngagementWeights>({
    applauseIntensity: 0.3,
    movementLevel: 0.25,
    noiseLevel: 0.2,
    facialExpression: 0.15,
    socialSentiment: 0.1
  });
  const [history, setHistory] = useState<{ timestamp: number; score: number }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const calculateScore = useCallback((metrics: EngagementMetrics, weights: EngagementWeights): number => {
    return Math.round(
      metrics.applauseIntensity * weights.applauseIntensity +
      metrics.movementLevel * weights.movementLevel +
      metrics.noiseLevel * weights.noiseLevel +
      metrics.facialExpression * weights.facialExpression +
      metrics.socialSentiment * weights.socialSentiment
    );
  }, []);

  const getScoreColor = useMemo(() => (score: number): string => {
    if (score >= 71) return 'text-green-400';
    if (score >= 31) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const exportData = useThrottleCallback(() => {
    const csv = [
      'Timestamp,Score,Applause,Movement,Noise,Facial,Social',
      ...history.map(entry => 
        `${new Date(entry.timestamp).toISOString()},${entry.score},${metrics.applauseIntensity},${metrics.movementLevel},${metrics.noiseLevel},${metrics.facialExpression},${metrics.socialSentiment}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'engagement-data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);

  useEffect(() => {
    let isSubscribed = true;
    const interval = setInterval(() => {
      if (!isSubscribed) return;
      
      // Simulate real metrics (replace with actual data sources)
      const newMetrics = {
        applauseIntensity: Math.random() * 100,
        movementLevel: Math.random() * 100,
        noiseLevel: Math.random() * 100,
        facialExpression: Math.random() * 100,
        socialSentiment: Math.random() * 100
      };
      setMetrics(newMetrics);

      // Calculate new score
      const newScore = calculateScore(newMetrics, weights);
      setScore(newScore);

      // Update history
      const now = Date.now();
      setHistory(prev => {
        const newHistory = [...prev, { timestamp: now, score: newScore }]
          .filter(entry => now - entry.timestamp <= 3600000); // Keep last hour
        
        // Check for significant changes
        if (newHistory.length >= 2) {
          const recentScores = newHistory
            .filter(entry => now - entry.timestamp <= 60000) // Last minute
            .map(entry => entry.score);
          
          const scoreChange = Math.abs(recentScores[recentScores.length - 1] - recentScores[0]);
          if (scoreChange > 20) {
            setAlerts(prev => [...prev, `Score changed by ${scoreChange.toFixed(1)} points in the last minute`]);
          }
        }
        
        return newHistory;
      });
    }, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [weights]);


  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Crowd Engagement Score</h2>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={Settings}
              onClick={() => setShowSettings(!showSettings)}
            >
              Adjust Weights
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={exportData}
            >
              Export Data
            </Button>
          </div>
        </div>

        {/* Score Gauge */}
        <div 
          className="flex justify-center mb-8"
          role="meter"
          aria-label="Crowd Engagement Score"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${score * 2.83} 283`}
                strokeLinecap="round"
                className={`${getScoreColor(score)} transform -rotate-90 origin-center transition-all duration-700`}
              />
              <text
                x="50"
                y="50"
                role="presentation"
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-3xl font-bold ${getScoreColor(score)}`}
              >
                {score}
              </text>
              <title>Engagement Score: {score}%</title>
            </svg>
          </div>
        </div>

        {/* Metric Contributions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="bg-white/5 rounded-lg p-3">
              <p className="text-sm text-white/70 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-xl font-semibold text-white">{Math.round(value)}%</p>
              <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weight Adjustment Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Adjust Weights</h3>
              <div className="space-y-4">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-white/70 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <span className="text-sm text-white">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={value}
                      onChange={(e) => setWeights(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-4 right-4 bg-red-500/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-white">{alert}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Trend Graph */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Score Trend</h3>
        <div className="h-48 relative">
          <svg className="w-full h-full">
            {history.length > 1 && (
              <path
                d={`M ${history.map((entry, i) => {
                  const x = (i / (history.length - 1)) * 100;
                  const y = 100 - entry.score;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}`}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
              />
            )}
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </Card>
    </div>
  );
};