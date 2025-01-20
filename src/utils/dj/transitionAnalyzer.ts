import { AudioMetrics } from '../../types/audio';

interface TransitionSuggestion {
  type: 'cut' | 'blend' | 'echo_out' | 'filter_fade';
  confidence: number;
  timing: number;
  reason: string;
}

export class TransitionAnalyzer {
  analyzeTransitionPoints(
    metrics: AudioMetrics,
    history: AudioMetrics[]
  ): TransitionSuggestion[] {
    const suggestions: TransitionSuggestion[] = [];
    const energyTrend = this.analyzeEnergyTrend(history);
    const structuralPosition = this.detectStructuralPosition(history);

    // Suggest transitions based on energy levels and trends
    if (metrics.physical > 80 && energyTrend === 'peak') {
      suggestions.push({
        type: 'cut',
        confidence: 0.85,
        timing: 8,
        reason: 'High energy peak moment approaching'
      });
    }

    if (metrics.emotional > 70 && energyTrend === 'building') {
      suggestions.push({
        type: 'blend',
        confidence: 0.75,
        timing: 16,
        reason: 'Emotional build-up detected'
      });
    }

    if (metrics.physical < 40 && structuralPosition === 'breakdown') {
      suggestions.push({
        type: 'echo_out',
        confidence: 0.9,
        timing: 32,
        reason: 'Breakdown section ideal for atmospheric transition'
      });
    }

    return suggestions;
  }

  private analyzeEnergyTrend(history: AudioMetrics[]): 'building' | 'peak' | 'falling' {
    if (history.length < 2) return 'building';

    const recent = history.slice(-5);
    const energyChange = recent[recent.length - 1].physical - recent[0].physical;

    if (Math.abs(energyChange) < 5) return 'peak';
    return energyChange > 0 ? 'building' : 'falling';
  }

  private detectStructuralPosition(history: AudioMetrics[]): 'intro' | 'breakdown' | 'drop' | 'outro' {
    // Analyze recent history to detect song structure
    const recent = history.slice(-10);
    const avgEnergy = recent.reduce((sum, m) => sum + m.physical, 0) / recent.length;
    
    if (avgEnergy < 30) return 'breakdown';
    if (avgEnergy > 80) return 'drop';
    return 'intro';
  }
}