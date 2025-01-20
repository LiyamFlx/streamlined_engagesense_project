import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  count = 1,
  className = "h-4 bg-white/10 rounded"
}) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`animate-pulse ${className}`} />
    ))}
  </div>
);