import React from 'react';
import { Wand2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { AudioMetrics } from '../../types/audio';

interface TransitionSuggestion {
  type: 'cut' | 'blend' | 'echo_out' | 'filter_fade';
  confidence: number;
  timing: number; // seconds until suggested transition
  reason: string;
}

interface TransitionSuggestionsProps {
  currentMetrics: AudioMetrics;
  suggestions: TransitionSuggestion[];
}

export const TransitionSuggestions: React.FC<TransitionSuggestionsProps> = ({
  currentMetrics,
  suggestions
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Transition Suggestions
        </h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-white capitalize">
                  {suggestion.type.replace('_', ' ')}
                </h4>
                <p className="text-sm text-white/70 mt-1">
                  {suggestion.reason}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-white/70">
                  {suggestion.timing}s
                </span>
                <div className="text-xs text-green-400">
                  {Math.round(suggestion.confidence * 100)}% match
                </div>
              </div>
            </div>
            
            <div className="mt-2 w-full bg-white/10 rounded-full h-1">
              <div
                className="h-1 rounded-full bg-green-500"
                style={{ width: `${suggestion.confidence * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};