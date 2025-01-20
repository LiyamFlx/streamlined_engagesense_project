// Track scoring interface
interface TrackScore {
  energy: number;
  bpm: number;
  genre: number;
  mood: number;
  transition: number;
}

interface AnalysisFactors {
  energyLevel: number;
  crowdMomentum: number;
  currentBPM: number;
  dominantGenre: string;
  currentMood: string;
  transitionType: string;
}

export class TrackAnalyzer {
  private readonly BPM_TOLERANCE = 8;
  private readonly ENERGY_WEIGHT = 0.4;
  private readonly GENRE_WEIGHT = 0.3;
  private readonly BPM_WEIGHT = 0.3;
  private readonly MOOD_WEIGHT = 0.2;
  private readonly TRANSITION_WEIGHT = 0.2;

  analyzeCurrentState(
    metrics: AudioMetrics,
    history: AudioMetrics[],
    currentBPM: number
  ): AnalysisFactors {
    const energyLevel = this.calculateEnergyLevel(metrics);
    const crowdMomentum = this.analyzeMomentum(history);
    const currentMood = this.analyzeMood(metrics);
    const dominantGenre = this.determineDominantGenre(metrics, crowdMomentum);
    const transitionType = this.determineTransitionType(crowdMomentum, history);

    return {
      energyLevel,
      crowdMomentum,
      currentBPM,
      dominantGenre,
      currentMood,
      transitionType
    };
  }

  calculateTrackScore(
    track: TrackRecommendation,
    factors: AnalysisFactors
  ): number {
    const scores: TrackScore = {
      energy: this.calculateEnergyScore(track.energy, factors.energyLevel),
      bpm: this.calculateBPMScore(track.bpm, factors.currentBPM),
      genre: this.calculateGenreScore(track.genre, factors.dominantGenre),
      mood: this.calculateMoodCompatibility(track, factors.currentMood),
      transition: this.calculateTransitionFit(track, factors.transitionType)
    };

    return this.computeWeightedScore(scores);
  }

  private calculateEnergyScore(trackEnergy: number, targetEnergy: number): number {
    const diff = Math.abs(trackEnergy - targetEnergy);
    return Math.max(0, 1 - diff / 100);
  }

  private calculateBPMScore(trackBPM: number, currentBPM: number): number {
    const diff = Math.abs(trackBPM - currentBPM);
    return diff <= this.BPM_TOLERANCE ? 1 : Math.max(0, 1 - (diff - this.BPM_TOLERANCE) / 20);
  }

  private calculateGenreScore(trackGenre: string, targetGenre: string): number {
    if (trackGenre === targetGenre) return 1;
    
    const genreCompatibility: Record<string, string[]> = {
      'House': ['Tech House', 'Progressive House', 'Deep House'],
      'Techno': ['Tech House', 'Minimal', 'Progressive Techno'],
      'Trance': ['Progressive Trance', 'Progressive House', 'Uplifting Trance'],
      'Progressive House': ['House', 'Trance', 'Deep House']
    };

    return genreCompatibility[targetGenre]?.includes(trackGenre) ? 0.7 : 0.3;
  }

  private calculateMoodCompatibility(track: TrackRecommendation, currentMood: string): number {
    const moodMap: Record<string, string[]> = {
      'energetic': ['House', 'Techno'],
      'melodic': ['Trance', 'Progressive House'],
      'atmospheric': ['Deep House', 'Ambient Techno'],
      'driving': ['Tech House', 'Peak Time Techno']
    };

    return moodMap[currentMood]?.includes(track.genre) ? 1 : 0.5;
  }

  private calculateTransitionFit(track: TrackRecommendation, transitionType: string): number {
    const transitionScores: Record<string, (track: TrackRecommendation) => number> = {
      'build': (t) => t.energy > 70 ? 1 : 0.5,
      'drop': (t) => t.energy < 50 ? 1 : 0.5,
      'blend': (t) => 0.8 // Neutral score for smooth transitions
    };

    return transitionScores[transitionType]?.(track) ?? 0.5;
  }

  private computeWeightedScore(scores: TrackScore): number {
    return (
      scores.energy * this.ENERGY_WEIGHT +
      scores.bpm * this.BPM_WEIGHT +
      scores.genre * this.GENRE_WEIGHT +
      scores.mood * this.MOOD_WEIGHT +
      scores.transition * this.TRANSITION_WEIGHT
    );
  }

  private calculateEnergyLevel(metrics: AudioMetrics): number {
    return (
      metrics.physical * 0.4 +
      metrics.emotional * 0.3 +
      metrics.mental * 0.2 +
      metrics.spiritual * 0.1
    );
  }

  private analyzeMomentum(history: AudioMetrics[]): number {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-5);
    const energyChange = recent.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return acc;
      return acc + (this.calculateEnergyLevel(curr) - this.calculateEnergyLevel(arr[idx - 1]));
    }, 0);

    return Math.min(Math.max(energyChange * 10, -100), 100);
  }

  private analyzeMood(metrics: AudioMetrics): string {
    const { physical, emotional, mental, spiritual } = metrics;
    
    if (physical > 75 && mental > 60) return 'driving';
    if (emotional > 75 && spiritual > 60) return 'melodic';
    if (mental > 75 && spiritual > 60) return 'atmospheric';
    return 'energetic';
  }

  private determineDominantGenre(metrics: AudioMetrics, momentum: number): string {
    if (metrics.physical > 80 && momentum > 50) return 'House';
    if (metrics.emotional > 80) return 'Trance';
    if (metrics.mental > 80) return 'Techno';
    return 'Progressive House';
  }

  private determineTransitionType(momentum: number, history: AudioMetrics[]): string {
    const recentEnergy = history.slice(-3).map(m => this.calculateEnergyLevel(m));
    const energyTrend = recentEnergy[recentEnergy.length - 1] - recentEnergy[0];
    
    if (momentum > 30 && energyTrend > 10) return 'build';
    if (momentum < -20 || energyTrend < -10) return 'drop';
    return 'blend';
  }
}