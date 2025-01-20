import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorRecoveryProps {
  error: Error;
  resetError: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  resetError,
  maxRetries = 3,
  retryDelay = 1000
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (isRetrying) {
      const timer = setTimeout(() => {
        resetError();
        setIsRetrying(false);
      }, retryDelay * (retryCount + 1));

      return () => clearTimeout(timer);
    }
  }, [isRetrying, retryCount, retryDelay, resetError]);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setIsRetrying(true);
    }
  };

  return (
    <div className="p-4 bg-red-500/10 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Error Occurred</h3>
      </div>
      <p className="text-white/70 mb-4">{error.message}</p>
      {retryCount < maxRetries ? (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      ) : (
        <p className="text-red-400">Maximum retry attempts reached</p>
      )}
    </div>
  );
};