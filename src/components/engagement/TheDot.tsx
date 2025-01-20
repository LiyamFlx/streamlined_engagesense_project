import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface TheDotProps {
  metrics: {
    physical: number;
    emotional: number;
    mental: number;
    spiritual: number;
  };
  weights: {
    physical: number;
    emotional: number;
    mental: number;
    spiritual: number;
  };
}

export const TheDot: React.FC<TheDotProps> = ({ metrics, weights }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate dot position based on weighted metrics
  const calculateDotPosition = () => {
    const totalScore = 
      metrics.physical * weights.physical +
      metrics.emotional * weights.emotional +
      metrics.mental * weights.mental +
      metrics.spiritual * weights.spiritual;

    const maxScore = 
      100 * weights.physical +
      100 * weights.emotional +
      100 * weights.mental +
      100 * weights.spiritual;

    const percentage = (totalScore / maxScore) * 100;
    
    // Convert percentage to coordinates
    const angle = (percentage / 100) * Math.PI * 2;
    const radius = 120; // Circle radius
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return { x, y, percentage };
  };

  // Draw the circular track
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw quadrant lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const { x, y, percentage } = calculateDotPosition();
  const dotColor = percentage > 75 ? 'bg-green-500' :
                  percentage > 50 ? 'bg-yellow-500' :
                  'bg-red-500';

  return (
    <Card className="p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Engagement Score</h3>
        <p className="text-sm text-white/70">Real-time crowd engagement visualization</p>
      </div>

      <div className="relative w-[300px] h-[300px] mx-auto">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="absolute inset-0"
        />
        
        <motion.div
          className={`absolute w-6 h-6 rounded-full ${dotColor} shadow-lg`}
          initial={false}
          animate={{
            x: x + 150 - 12, // Center offset
            y: y + 150 - 12,
            scale: [1, 1.1, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        />

        {/* Score Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
            <span className="block text-sm text-white/70">Overall Score</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm text-white/70">Physical</div>
          <div className="font-semibold text-white">{metrics.physical}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/70">Emotional</div>
          <div className="font-semibold text-white">{metrics.emotional}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/70">Mental</div>
          <div className="font-semibold text-white">{metrics.mental}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/70">Spiritual</div>
          <div className="font-semibold text-white">{metrics.spiritual}%</div>
        </div>
      </div>
    </Card>
  );
};