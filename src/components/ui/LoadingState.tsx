import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-lg animate-pulse">
    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    <p className="mt-4 text-white/70">{message}</p>
  </div>
);