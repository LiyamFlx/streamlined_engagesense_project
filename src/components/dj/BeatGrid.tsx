import React, { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';

interface BeatGridProps {
  bpm: number;
  isPlaying: boolean;
  beatMarkers: number[];
}

export const BeatGrid: React.FC<BeatGridProps> = ({ bpm, isPlaying, beatMarkers }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Draw grid lines
      const beatSpacing = width / 16; // 4 bars of 4 beats
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      
      for (let i = 0; i <= 16; i++) {
        const x = i * beatSpacing;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw beat markers
      beatMarkers.forEach(marker => {
        const x = (marker % 16) * beatSpacing;
        ctx.fillStyle = 'rgba(147, 51, 234, 0.5)';
        ctx.fillRect(x - 2, 0, 4, height);
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, beatMarkers, bpm]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Beat Grid</h3>
        <span className="text-white/70">{bpm} BPM</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-24 bg-black/20 rounded-lg"
        width={800}
        height={96}
      />
    </Card>
  );
};