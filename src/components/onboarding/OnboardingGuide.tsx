import React, { useState } from 'react';
import { X } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to EngageSense',
    description: 'Your AI-powered audio analysis assistant for perfect crowd engagement.',
    target: '#dashboard'
  },
  {
    title: 'Real-time Analysis',
    description: 'Monitor crowd energy and engagement metrics as they happen.',
    target: '#analysis'
  },
  {
    title: 'Smart Recommendations',
    description: 'Get AI-powered track suggestions based on crowd response.',
    target: '#recommendations'
  }
];

export const OnboardingGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-purple-900/90 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-purple-500/20">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10"
      >
        <X className="w-4 h-4 text-white/70" />
      </button>

      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
      <p className="text-white/70 mb-4">{step.description}</p>

      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-purple-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-3 py-1 text-sm text-white/70 hover:text-white"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (currentStep < ONBOARDING_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                setIsDismissed(true);
              }
            }}
            className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};