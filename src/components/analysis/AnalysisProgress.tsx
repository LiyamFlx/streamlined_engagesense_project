import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';

interface AnalysisProgressProps {
  progress: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Analyzing Recording</h3>
      <span className="text-white/70">{progress}%</span>
    </div>
    
    <div className="w-full bg-white/10 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-purple-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>

    <div className="flex items-center justify-center mt-4 text-white/70">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      Processing audio features...
    </div>
  </Card>
);