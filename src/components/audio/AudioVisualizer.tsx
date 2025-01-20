import React, { useEffect } from 'react';
import { useAudioVisualization } from '../../hooks/useAudioVisualization';
import { Card } from '../ui/Card';

interface AudioVisualizerProps {
  analyzerNode: AnalyserNode | null;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyzerNode,
  isPlaying
}) => {
  const { canvasRef, drawFrame } = useAudioVisualization({
    width: 800,
    height: 200,
    barWidth: 3,
    barGap: 1,
    barColor: '#9333ea'
  });

  useEffect(() => {
    if (analyzerNode && isPlaying) {
      drawFrame(analyzerNode);
    }
  }, [analyzerNode, isPlaying, drawFrame]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Audio Visualization</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full bg-black/20 rounded-lg"
      />
    </Card>
  );
};