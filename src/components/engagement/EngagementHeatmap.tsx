import React, { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { AudioMetrics } from '../../types/audio';
import { drawHeatmap } from '../../utils/visualization/heatmapDrawing';

interface EngagementHeatmapProps {
  history: AudioMetrics[];
  width?: number;
  height?: number;
}

export const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({
  history,
  width = 800,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    drawHeatmap(ctx, history, width, height);
  }, [history, width, height]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Engagement Heatmap</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', maxWidth: width }}
          className="bg-black/20 rounded-lg"
        />
        {history.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            No data available
          </div>
        )}
      </div>
    </Card>
  );
};