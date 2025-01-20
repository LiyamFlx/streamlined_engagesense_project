import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { Card } from '../ui/Card';

interface FrequencyBarsProps {
  analyzerNode: AnalyserNode | null;
  isActive: boolean;
  className?: string;
}

export const FrequencyBars: React.FC<FrequencyBarsProps> = ({
  analyzerNode,
  isActive,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const bufferRef = useRef<Uint8Array>();
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const fpsRef = useRef<number>(0);

  // Performance monitoring
  const monitorPerformance = useCallback(() => {
    const now = performance.now();
    frameCount.current++;

    if (now - lastFrameTime.current >= 1000) {
      fpsRef.current = frameCount.current;
      frameCount.current = 0;
      lastFrameTime.current = now;

      // Reduce visual complexity if FPS drops below threshold
      if (fpsRef.current < 30) {
        setReducedQuality(true);
      } else {
        setReducedQuality(false);
      }
    }
  }, []);

  const [reducedQuality, setReducedQuality] = useState(false);
  const [isMobile] = useState(() => window.innerWidth < 768);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Implement pinch-to-zoom or swipe gestures
    if (Math.abs(deltaY) > 50) {
      setReducedQuality(deltaY > 0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  // Validate analyzer node
  const isValidAnalyzer = useCallback(() => {
    return analyzerNode && 
           analyzerNode.context.state !== 'closed' && 
           analyzerNode.context.state !== 'suspended';
  }, [analyzerNode]);
  
  // Memoize analyzer configuration
  const analyzerConfig = useMemo(() => ({
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -70,
    maxDecibels: -30
  }), []);

  useEffect(() => {
    if (!isValidAnalyzer() || !isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: false, // Optimization: disable alpha channel
      desynchronized: true // Optimization: reduce latency
    });
    if (!ctx) return;

    // Store context reference
    contextRef.current = ctx;

    // Initialize buffer once
    if (!bufferRef.current) {
      bufferRef.current = new Uint8Array(analyzerNode.frequencyBinCount);
    }

    // Configure analyzer
    Object.assign(analyzerNode, analyzerConfig);

    const draw = () => {
      if (!contextRef.current || !canvas || !isValidAnalyzer()) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        return;
      }

      monitorPerformance();

      // Adjust visualization quality based on performance
      const barWidth = (reducedQuality || isMobile) ? 4 : 2;
      const gap = (reducedQuality || isMobile) ? 2 : 1;
      const skipFrames = (reducedQuality || isMobile) ? 2 : 1;

      // Only update every N frames when in reduced quality mode
      if (reducedQuality && frameCount.current % skipFrames !== 0) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      analyzerNode.getByteFrequencyData(bufferRef.current);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const bars = Math.min(bufferRef.current.length, Math.floor(canvas.width / (barWidth + gap)));
      const step = Math.floor(bufferRef.current.length / bars);

      let x = 0;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const value = bufferRef.current[i * step];
        const percent = value / 255;
        const barHeight = canvas.height * percent;

        const hue = (i / bars) * 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
        ctx.fillRect(x, rect.height - barHeight, barWidth, barHeight);

        x += barWidth + gap;
      }
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [analyzerNode, isActive, isValidAnalyzer]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Frequency Analysis</h3>
      <div className="relative bg-black/20 rounded-lg overflow-hidden" 
           style={{ height: '200px', minWidth: '100px' }}
           onTouchStart={handleTouchStart}
           onTouchMove={handleTouchMove}
           onTouchEnd={handleTouchEnd}>
        <canvas 
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
        {(!isActive || !analyzerNode) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-white/60">{!isActive ? 'Recording paused' : 'Initializing...'}</p>
          </div>
        )}
      </div>
    </Card>
  );
};