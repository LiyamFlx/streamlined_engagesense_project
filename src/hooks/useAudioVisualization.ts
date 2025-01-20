import { useRef, useEffect, useCallback } from 'react';

interface VisualizationOptions {
  width: number;
  height: number;
  barWidth?: number;
  barGap?: number;
  barColor?: string;
}

export const useAudioVisualization = (options: VisualizationOptions) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();

  const drawFrame = useCallback((analyzerNode: AnalyserNode) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { width, height, barWidth = 2, barGap = 1, barColor = '#9333ea' } = options;
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(() => draw());
      analyzerNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      const bars = Math.min(bufferLength, Math.floor(width / (barWidth + barGap)));
      const step = Math.floor(bufferLength / bars);

      for (let i = 0; i < bars; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = height * percent;

        ctx.fillStyle = barColor;
        ctx.fillRect(
          i * (barWidth + barGap),
          height - barHeight,
          barWidth,
          barHeight
        );
      }
    };

    draw();
  }, [options]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    drawFrame
  };
};