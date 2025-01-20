import React from 'react';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  icon: React.ReactNode;
}

interface EngagementRewardsProps {
  achievements: Achievement[];
  level: number;
  experience: number;
  nextLevelExp: number;
}

export const EngagementRewards: React.FC<EngagementRewardsProps> = ({
  achievements,
  level,
  experience,
  nextLevelExp
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Your Progress</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">Level {level}</p>
          <p className="text-sm text-white/70">{experience}/{nextLevelExp} XP</p>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mb-8">
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300"
            initial={{ width: 0 }}
            animate={{ width: `${(experience / nextLevelExp) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              achievement.completed ? 'bg-green-500/20' : 'bg-white/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                achievement.completed ? 'bg-green-500/30' : 'bg-white/10'
              }`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">{achievement.title}</h3>
                    <p className="text-sm text-white/70 mt-1">{achievement.description}</p>
                  </div>
                  {achievement.completed && (
                    <Star className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Progress</span>
                    <span className="text-white">{achievement.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        achievement.completed ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};