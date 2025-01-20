import React, { useEffect, useState } from 'react';
import { DJDashboard } from '../components/dj/DJDashboard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { TheDot } from '../components/engagement/TheDot';
import { EngagementSettings } from '../components/engagement/EngagementSettings';
import { Sun, Moon, X } from 'lucide-react';
import { CrowdEngagementScore } from '../components/engagement/CrowdEngagementScore';

import { useErrorBoundary } from '../hooks/useErrorBoundary';

const Dashboard: React.FC = () => {
  const { handleError } = useErrorBoundary();

  const [isReady, setIsReady] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [weights, setWeights] = useState({
    physical: 0.3,
    emotional: 0.3,
    mental: 0.2,
    spiritual: 0.2
  });

  // Remove duplicate DJDashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Ensure all required components are loaded
        await Promise.all([
          // Add any async initialization here
          new Promise(resolve => setTimeout(resolve, 0)) // Microtask delay
        ]);

        setIsReady(true);
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Dashboard initialization failed'));
        setIsReady(false);
      }
    };

    initializeDashboard();

    return () => {
      setIsReady(false);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-6 space-y-6">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Sun className="w-5 h-5 text-white dark:hidden" />
              <Moon className="w-5 h-5 text-white hidden dark:block" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Engagement Score and Settings */}
          <div className="lg:col-span-8 space-y-6">
            <CrowdEngagementScore />
            <DJDashboard />
          </div>
          
          {/* Engagement Metrics and Weights */}
          <div className="lg:col-span-4 space-y-6">
            <EngagementSettings
              weights={weights}
              onWeightsChange={setWeights}
            />
            <TheDot
              metrics={{
                physical: 75,
                emotional: 80,
                mental: 65,
                spiritual: 70
              }}
              weights={weights}
            />
          </div>
        </div>
        
        {/* First Time User Guide */}
        {showGuide && (
          <div className="fixed bottom-4 right-4 max-w-sm bg-purple-900/90 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-purple-500/20 animate-slide-up">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
            <h3 className="text-lg font-semibold text-white mb-2">Welcome to EngageSense!</h3>
            <p className="text-white/70 mb-4">Track real-time crowd engagement and make data-driven decisions.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;