import React from 'react';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioMetrics } from '../../types/audio';

interface PredictionVisualizerProps {
  currentMetrics: AudioMetrics;
  predictedMetrics: AudioMetrics;
  confidence: number;
  recommendations: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export const PredictionVisualizer: React.FC<PredictionVisualizerProps> = ({
  currentMetrics,
  predictedMetrics,
  confidence,
  recommendations
}) => {
  return (
    <div className="space-y-6">
      {/* Current vs Predicted Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Engagement Prediction
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Current Metrics */}
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Current</h4>
            <div className="space-y-3">
              {Object.entries(currentMetrics).map(([key, value]) => (
                <div key={key} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white capitalize">{key}</span>
                    <span className="text-white/70">{value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predicted Metrics */}
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Predicted</h4>
            <div className="space-y-3">
              {Object.entries(predictedMetrics).map(([key, value]) => (
                <div key={key} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white capitalize">{key}</span>
                    <span className="text-white/70">{value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Prediction Confidence</span>
            <span className="text-white">{confidence}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                confidence > 75 ? 'bg-green-500' :
                confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          AI Recommendations
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${
                  rec.severity === 'high' ? 'bg-red-500/20' :
                  rec.severity === 'medium' ? 'bg-yellow-500/20' :
                  'bg-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    rec.severity === 'high' ? 'text-red-400' :
                    rec.severity === 'medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-white">{rec.type}</p>
                    <p className="text-sm text-white/70 mt-1">{rec.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};