import { TrackFeatures, ListeningContext, RecommendationScore } from './types';

export class TrackScoring {
  private readonly ENERGY_WEIGHT = 0.3;
  private readonly TEMPO_WEIGHT = 0.2;
  private readonly MOOD_WEIGHT = 0.25;
  private readonly GENRE_WEIGHT = 0.15;
  private readonly NOVELTY_WEIGHT = 0.1;

  calculateScore(track: TrackFeatures, context: ListeningContext): RecommendationScore {
    const energyMatch = this.calculateEnergyMatch(track, context);
    const tempoMatch = this.calculateTempoMatch(track, context);
    const moodMatch = this.calculateMoodMatch(track, context);
    const genreMatch = this.calculateGenreMatch(track, context);
    const noveltyScore = this.calculateNoveltyScore(track, context);

    const final = this.computeWeightedScore({
      energyMatch,
      tempoMatch,
      moodMatch,
      genreMatch,
      noveltyScore
    });

    return {
      energyMatch,
      tempoMatch,
      moodMatch,
      genreMatch,
      noveltyScore,
      final
    };
  }

  private calculateEnergyMatch(track: TrackFeatures, context: ListeningContext): number {
    const targetEnergy = this.getTargetEnergy(context);
    const diff = Math.abs(track.energy - targetEnergy);
    return Math.max(0, 1 - diff);
  }

  private calculateTempoMatch(track: TrackFeatures, context: ListeningContext): number {
    if (!context.currentTrack) return 1;
    
    const tempoDiff = Math.abs(track.tempo - context.currentTrack.tempo);
    return Math.max(0, 1 - (tempoDiff / 20)); // 20 BPM tolerance
  }

  private calculateMoodMatch(track: TrackFeatures, context: ListeningContext): number {
    const moodScores = {
      energetic: track.energy * 0.6 + track.valence * 0.4,
      calm: (1 - track.energy) * 0.7 + track.acousticness * 0.3,
      focused: track.instrumentalness * 0.5 + (1 - track.valence) * 0.5,
      euphoric: track.valence * 0.7 + track.energy * 0.3
    };

    return moodScores[context.crowdMood];
  }

  private calculateGenreMatch(track: TrackFeatures, context: ListeningContext): number {
    // Implementation would use genre classification based on audio features
    return 0.8; // Placeholder
  }

  private calculateNoveltyScore(track: TrackFeatures, context: ListeningContext): number {
    const recentTrackIds = context.recentTracks.map(t => t.id);
    if (recentTrackIds.includes(track.id)) return 0;
    
    const uniqueFeatures = this.calculateFeatureUniqueness(track, context.recentTracks);
    return uniqueFeatures;
  }

  private getTargetEnergy(context: ListeningContext): number {
    const timeBasedAdjustment = this.getTimeBasedEnergyAdjustment(context.timeOfDay);
    const userPreferenceAdjustment = (context.userPreferences.energyPreference - 0.5) * 0.2;
    
    return Math.min(1, Math.max(0, 
      context.currentEnergy + timeBasedAdjustment + userPreferenceAdjustment
    ));
  }

  private getTimeBasedEnergyAdjustment(hour: number): number {
    if (hour >= 22 || hour <= 4) return 0.1;  // Late night
    if (hour >= 16 && hour < 22) return 0.2;  // Evening
    return 0;  // Default
  }

  private calculateFeatureUniqueness(track: TrackFeatures, recentTracks: TrackFeatures[]): number {
    if (recentTracks.length === 0) return 1;

    const features = ['energy', 'tempo', 'danceability', 'valence'] as const;
    const avgDifference = features.reduce((sum, feature) => {
      const avgFeature = recentTracks.reduce((s, t) => s + t[feature], 0) / recentTracks.length;
      return sum + Math.abs(track[feature] - avgFeature);
    }, 0) / features.length;

    return Math.min(1, avgDifference * 2);
  }

  private computeWeightedScore(scores: Omit<RecommendationScore, 'final'>): number {
    return (
      scores.energyMatch * this.ENERGY_WEIGHT +
      scores.tempoMatch * this.TEMPO_WEIGHT +
      scores.moodMatch * this.MOOD_WEIGHT +
      scores.genreMatch * this.GENRE_WEIGHT +
      scores.noveltyScore * this.NOVELTY_WEIGHT
    );
  }
}