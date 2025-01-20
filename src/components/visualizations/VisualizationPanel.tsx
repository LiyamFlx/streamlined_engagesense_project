import React from 'react';
import { FrequencyBars } from './FrequencyBars';
import { EngagementHeatmap } from './EngagementHeatmap';
import { Card } from '../ui/Card';
import type { AudioData } from '../../types/audio';

interface VisualizationPanelProps {
  audioData: AudioData | null;
  isActive: boolean;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  audioData,
  isActive,
}) => (
  <div className="space-y-6">
    {audioData?.analyzerNode && (
      <FrequencyBars
        analyzerNode={audioData.analyzerNode}
        isActive={isActive}
      />
    )}
    {audioData?.metrics && (
      <EngagementHeatmap history={[audioData.metrics]} />
    )}
    {!audioData && (
      <Card className="p-6 text-center">
        <p className="text-white/60">
          Start recording to see visualizations
        </p>
      </Card>
    )}
  </div>
);