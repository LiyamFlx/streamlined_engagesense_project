import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  status?: 'idle' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status = 'idle',
  error
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 rounded-full bg-gradient-to-r ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Message */}
      <div className="flex items-center gap-2 text-sm">
        {status === 'uploading' && (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
        )}
        {status === 'complete' && (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        )}
        {status === 'error' && (
          <AlertCircle className="w-4 h-4 text-red-400" />
        )}
        <span className={`
          ${status === 'complete' ? 'text-green-400' : ''}
          ${status === 'error' ? 'text-red-400' : ''}
          ${status === 'uploading' ? 'text-purple-400' : ''}
          ${status === 'idle' ? 'text-gray-400' : ''}
        `}>
          {getStatusMessage()}
        </span>
      </div>

      {/* Screen Reader Only Progress */}
      <div className="sr-only" role="status" aria-live="polite">
        {getStatusMessage()}
      </div>
    </div>
  );
};