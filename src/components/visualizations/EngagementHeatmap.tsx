import React, { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import type { AudioMetrics } from '../../types/audio';
import { drawHeatmap } from '../../utils/visualization/heatmapDrawing';

interface EngagementHeatmapProps {
  history: AudioMetrics[];
}

export const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ history }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef(history);

  const updateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    if (historyRef.current.length > 0) {
      drawHeatmap(ctx, historyRef.current, rect.width, rect.height);
    }
  };

  useEffect(() => {
    historyRef.current = history;
    updateCanvas();
  }, [history]);

  useEffect(() => {
    const handleResize = () => updateCanvas();
    const resizeObserver = new ResizeObserver(handleResize);

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Engagement Heatmap</h3>
      <div className="relative" style={{ height: '240px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-black/20 rounded-lg"
          style={{ imageRendering: 'pixelated' }}
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