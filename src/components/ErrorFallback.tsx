import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
      </div>
      
      <p className="text-white/70 mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  </div>
);