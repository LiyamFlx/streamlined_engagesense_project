import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const AccessibleTooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    let timeout: NodeJS.Timeout;

    const showTooltip = () => {
      timeout = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
      clearTimeout(timeout);
      setIsVisible(false);
    };

    trigger.addEventListener('mouseenter', showTooltip);
    trigger.addEventListener('mouseleave', hideTooltip);
    trigger.addEventListener('focus', showTooltip);
    trigger.addEventListener('blur', hideTooltip);

    return () => {
      if (trigger) {
        trigger.removeEventListener('mouseenter', showTooltip);
        trigger.removeEventListener('mouseleave', hideTooltip);
        trigger.removeEventListener('focus', showTooltip);
        trigger.removeEventListener('blur', hideTooltip);
      }
      clearTimeout(timeout);
    };
  }, [delay]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div ref={triggerRef} className="relative inline-block">
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 
            rounded shadow-lg pointer-events-none
            ${positionClasses[position]}
            ${prefersReducedMotion ? '' : 'animate-fade-in'}
          `}
        >
          {content}
          <div className="sr-only" aria-live="polite">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};