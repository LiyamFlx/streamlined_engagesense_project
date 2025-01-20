import React, { useMemo, useCallback } from 'react';
import { Sliders } from 'lucide-react';
import { Card } from '../ui/Card';

interface EngagementWeight {
  value: number;
  label: string;
  description: string;
}

type EngagementWeights = Record<string, EngagementWeight>;

const DEFAULT_WEIGHTS: EngagementWeights = {
  physical: {
    value: 0.3,
    label: 'Physical',
    description: 'Movement and activity level'
  },
  emotional: {
    value: 0.3,
    label: 'Emotional',
    description: 'Crowd sentiment and mood'
  },
  mental: {
    value: 0.2,
    label: 'Mental',
    description: 'Focus and attention'
  },
  spiritual: {
    value: 0.2,
    label: 'Spiritual',
    description: 'Overall atmosphere'
  }
};

interface EngagementSettingsProps {
  weights: {
    physical: number;
    emotional: number;
    mental: number;
    spiritual: number;
  };
  onWeightsChange: (weights: {
    physical: number;
    emotional: number;
    mental: number;
    spiritual: number;
  }) => void;
}

export const EngagementSettings: React.FC<EngagementSettingsProps> = ({
  weights,
  onWeightsChange
}) => {
  const totalWeight = useMemo(() => 
    Object.values(weights).reduce((sum, weight) => sum + weight, 0),
    [weights]
  );

  const isValidWeight = useCallback((newValue: number, metric: string) => {
    const otherWeights = Object.entries(weights)
      .filter(([key]) => key !== metric)
      .reduce((sum, [, value]) => sum + value, 0);
    return otherWeights + newValue <= 1;
  }, [weights]);

  const handleWeightChange = (metric: keyof typeof weights, value: number) => {
    onWeightsChange({
      ...weights,
      [metric]: value
    });
  };

  return (
    <Card className="p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2" id="engagement-settings-title">
          <Sliders className="w-5 h-5 text-purple-400" />
          Engagement Weights
        </h2>
        <div className="text-sm text-white/70">
          Adjust weights to customize scoring
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(weights).map(([metric, value]) => (
          <div 
            key={metric} 
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all group"
            title={`Adjust ${metric} weight`}
          >
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-white capitalize">
                {metric}
              </label>
              <span className="text-sm text-purple-400 font-semibold group-hover:text-purple-300">
                {(value * 100).toFixed(0)}%
              </span>
            </div>
            
            <input
              type="range"
              aria-label={`Adjust ${metric} weight`}
              aria-valuemin={0.1}
              aria-valuemax={1}
              aria-valuenow={value}
              min="0.1"
              max="1"
              step="0.05"
              value={value}
              onChange={(e) => onWeightsChange({
                ...weights,
                [metric]: parseFloat(e.target.value)
              })}
              className="w-full accent-purple-500"
            />
            
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </div>
        ))}
        
        <div className="mt-6 bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Weight Distribution</h4>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
            {Object.entries(weights).map(([metric, value], index) => (
              <div
                key={metric}
                className={`h-full transition-all duration-300 ${
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-purple-500' :
                  index === 2 ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${value * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};