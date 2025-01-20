import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../ui/Card';

interface BeatMatchingGuideProps {
  currentBPM: number;
  targetBPM: number;
  phaseAlignment: number;
}

export const BeatMatchingGuide: React.FC<BeatMatchingGuideProps> = ({
  currentBPM,
  targetBPM,
  phaseAlignment
}) => {
  const bpmDifference = currentBPM - targetBPM;
  const isAligned = Math.abs(phaseAlignment) < 0.1;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Beat Matching Guide
        </h3>
        <span className="text-sm text-white/70">
          {currentBPM} BPM → {targetBPM} BPM
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70">BPM Adjustment</span>
            <span className={`font-medium ${
              Math.abs(bpmDifference) < 1 
                ? 'text-green-400' 
                : bpmDifference > 0 
                  ? 'text-red-400' 
                  : 'text-blue-400'
            }`}>
              {bpmDifference > 0 ? 'Slow Down' : 'Speed Up'} 
              ({Math.abs(bpmDifference).toFixed(1)})
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                Math.abs(bpmDifference) < 1 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, 100 - Math.abs(bpmDifference))}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70">Phase Alignment</span>
            <span className={`font-medium ${isAligned ? 'text-green-400' : 'text-yellow-400'}`}>
              {isAligned ? 'Aligned' : 'Adjusting'}
            </span>
          </div>
          <div className="relative h-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${
                isAligned ? 'bg-green-500' : 'bg-yellow-500'
              } animate-pulse`} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};