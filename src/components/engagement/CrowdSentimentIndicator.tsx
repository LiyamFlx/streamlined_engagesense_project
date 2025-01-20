import React from 'react';
import { Smile, PartyPopper, Music, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

interface CrowdSentimentIndicatorProps {
  sentiment: number; // 0-100
  trend: 'rising' | 'falling' | 'stable';
}

export const CrowdSentimentIndicator: React.FC<CrowdSentimentIndicatorProps> = ({
  sentiment,
  trend
}) => {
  const getEmoji = () => {
    if (sentiment >= 90) return PartyPopper;
    if (sentiment >= 70) return Sparkles;
    if (sentiment >= 50) return Smile;
    return Music;
  };

  const getColor = () => {
    if (sentiment >= 90) return 'bg-purple-500';
    if (sentiment >= 70) return 'bg-green-500';
    if (sentiment >= 50) return 'bg-blue-500';
    return 'bg-indigo-500';
  };

  const Icon = getEmoji();

  return (
    <Card className="p-6 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.6) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.3) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Crowd Sentiment</h3>
        <motion.span 
          className="text-2xl font-bold text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
        >
          {sentiment}%
        </motion.span>
      </div>

      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <motion.div
            className={`h-2 rounded-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${sentiment}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: trend === 'rising' ? [0, 10, 0] : trend === 'falling' ? [0, -10, 0] : 0
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon className={`w-12 h-12 ${
              sentiment >= 90 ? 'text-purple-400' :
              sentiment >= 70 ? 'text-green-400' :
              sentiment >= 50 ? 'text-blue-400' : 'text-indigo-400'
            }`} />
          </motion.div>
        </div>
        
        <motion.p
          className="text-center mt-4 text-white/80"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {sentiment >= 90 ? 'Peak Energy! 🎉' :
           sentiment >= 70 ? 'Crowd is Vibing! ✨' :
           sentiment >= 50 ? 'Good Energy 🎵' :
           'Building Up 🎧'}
        </motion.p>
      </div>
    </Card>
  );
};