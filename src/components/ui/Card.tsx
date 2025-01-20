import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div 
    className={`bg-black/30 backdrop-blur-sm rounded-lg 
      transition-all duration-300 ease-out
      hover:bg-black/40 hover:transform hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/5
      focus-within:ring-2 focus-within:ring-primary/50
      p-4 sm:p-6
      shadow-xl shadow-black/20 border border-white/5
      border border-white/10
      animate-scale-in
      ${className}`}
    role="region"
    tabIndex={0}
  >
    {children}
  </div>
);