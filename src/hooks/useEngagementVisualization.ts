import { useState, useEffect, useCallback } from 'react';
import { AudioMetrics } from '../types/audio';

interface EngagementVisualization {
  sentiment: number;
  trend: 'rising' | 'falling' | 'stable';
  history: AudioMetrics[];
}

export const useEngagementVisualization = (metrics: AudioMetrics | null): EngagementVisualization => {
  const [state, setState] = useState<EngagementVisualization>({
    sentiment: 50,
    trend: 'stable',
    history: [] 
  });

  const calculateSentiment = useCallback((metrics: AudioMetrics): number => {
    if (!metrics) return 50;

    const weights = {
      physical: 0.3,
      emotional: 0.4,
      mental: 0.2,
      spiritual: 0.1
    };

    return Math.round(
      Object.entries(weights).reduce(
        (acc, [key, weight]) => acc + (metrics[key as keyof AudioMetrics] ?? 0) * weight,
        0
      )
    );
  }, []);

  const analyzeTrend = useCallback((history: AudioMetrics[]): 'rising' | 'falling' | 'stable' => {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const firstSentiment = calculateSentiment(recent[0]);
    const lastSentiment = calculateSentiment(recent[recent.length - 1]);
    const change = lastSentiment - firstSentiment;

    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'rising' : 'falling';
  }, [calculateSentiment]);

  useEffect(() => {
    if (!metrics) return;

    setState(prevState => {
      const newHistory = [...prevState.history.slice(-50), metrics];
      const sentiment = calculateSentiment(metrics);
      const trend = analyzeTrend(newHistory);

      return {
        sentiment,
        trend,
        history: newHistory
      };
    });
  }, [metrics, calculateSentiment, analyzeTrend]);

  return state;
};