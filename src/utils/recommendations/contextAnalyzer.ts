import { ListeningContext, TrackFeatures } from './types';

export class ContextAnalyzer {
  analyzeContext(
    currentTrack: TrackFeatures | null,
    recentTracks: TrackFeatures[],
    crowdMetrics: { energy: number; mood: string },
    userPreferences: { genres: string[]; energy: number }
  ): ListeningContext {
    return {
      currentTrack,
      recentTracks: recentTracks.slice(-5),
      currentEnergy: this.calculateCurrentEnergy(crowdMetrics.energy, recentTracks),
      crowdMood: this.analyzeCrowdMood(crowdMetrics.mood) as ListeningContext['crowdMood'],
      timeOfDay: new Date().getHours(),
      userPreferences: {
        favoriteGenres: userPreferences.genres,
        dislikedGenres: [],
        energyPreference: userPreferences.energy,
        varietyPreference: 0.7,
        recentSkips: []
      }
    };
  }

  private calculateCurrentEnergy(crowdEnergy: number, recentTracks: TrackFeatures[]): number {
    if (recentTracks.length === 0) return crowdEnergy / 100;

    const recentEnergy = recentTracks
      .slice(-3)
      .reduce((sum, track) => sum + track.energy, 0) / 3;

    return (recentEnergy * 0.7 + (crowdEnergy / 100) * 0.3);
  }

  private analyzeCrowdMood(mood: string): string {
    const moodMap: Record<string, ListeningContext['crowdMood']> = {
      high_energy: 'energetic',
      relaxed: 'calm',
      attentive: 'focused',
      excited: 'euphoric'
    };

    return moodMap[mood] || 'energetic';
  }
}