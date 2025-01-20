import { AudioMetrics } from '../../types/audio';
import { TrackDetails } from '../../types/spotify';

interface PlaylistConfig {
  targetEnergy: number;
  genrePreferences: string[];
  bpmRange: { min: number; max: number };
}

export class DynamicPlaylistGenerator {
  private readonly TRANSITION_THRESHOLD = 0.8;
  private currentPlaylist: TrackDetails[] = [];

  async generatePlaylist(
    metrics: AudioMetrics,
    availableTracks: TrackDetails[],
    config: PlaylistConfig
  ): Promise<TrackDetails[]> {
    const scoredTracks = this.scoreTracksForContext(availableTracks, metrics, config);
    const optimizedPlaylist = this.optimizeTransitions(scoredTracks);
    
    this.currentPlaylist = optimizedPlaylist;
    return optimizedPlaylist;
  }

  async updatePlaylist(
    metrics: AudioMetrics,
    currentTrack: TrackDetails
  ): Promise<TrackDetails | null> {
    const energyDelta = this.calculateEnergyDelta(metrics);
    
    if (Math.abs(energyDelta) > this.TRANSITION_THRESHOLD) {
      const nextTrack = this.findOptimalTransition(currentTrack, metrics);
      if (nextTrack) {
        this.currentPlaylist = this.currentPlaylist.filter(t => t.id !== nextTrack.id);
        return nextTrack;
      }
    }

    return null;
  }

  private scoreTracksForContext(
    tracks: TrackDetails[],
    metrics: AudioMetrics,
    config: PlaylistConfig
  ): TrackDetails[] {
    return tracks
      .map(track => ({
        ...track,
        score: this.calculateTrackScore(track, metrics, config)
      }))
      .sort((a, b) => (b as any).score - (a as any).score);
  }

  private calculateTrackScore(
    track: TrackDetails,
    metrics: AudioMetrics,
    config: PlaylistConfig
  ): number {
    const energyMatch = 1 - Math.abs(track.energy - config.targetEnergy) / 100;
    const genreMatch = config.genrePreferences.includes(track.genre) ? 1 : 0.5;
    const bpmMatch = this.calculateBPMMatch(track.bpm, config.bpmRange);

    return (energyMatch * 0.4 + genreMatch * 0.3 + bpmMatch * 0.3);
  }

  private optimizeTransitions(tracks: TrackDetails[]): TrackDetails[] {
    const optimized: TrackDetails[] = [tracks[0]];
    const remaining = tracks.slice(1);

    while (remaining.length > 0) {
      const lastTrack = optimized[optimized.length - 1];
      const nextTrack = this.findBestTransition(lastTrack, remaining);
      
      optimized.push(nextTrack);
      remaining.splice(remaining.indexOf(nextTrack), 1);
    }

    return optimized;
  }

  private findBestTransition(
    fromTrack: TrackDetails,
    candidates: TrackDetails[]
  ): TrackDetails {
    return candidates.reduce((best, current) => {
      const currentScore = this.calculateTransitionScore(fromTrack, current);
      const bestScore = this.calculateTransitionScore(fromTrack, best);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateTransitionScore(from: TrackDetails, to: TrackDetails): number {
    const bpmDiff = Math.abs(from.bpm - to.bpm);
    const keyCompatibility = this.calculateKeyCompatibility(from.key, to.key);
    const energyFlow = 1 - Math.abs(from.energy - to.energy) / 100;

    return (
      (1 - bpmDiff / 20) * 0.4 +
      keyCompatibility * 0.3 +
      energyFlow * 0.3
    );
  }

  private calculateBPMMatch(bpm: number, range: { min: number; max: number }): number {
    if (bpm >= range.min && bpm <= range.max) return 1;
    const minDiff = Math.abs(bpm - range.min);
    const maxDiff = Math.abs(bpm - range.max);
    return 1 - Math.min(minDiff, maxDiff) / 20;
  }

  private calculateKeyCompatibility(key1: string, key2: string): number {
    // Implement musical key compatibility logic
    return 0.8; // Placeholder
  }

  private calculateEnergyDelta(metrics: AudioMetrics): number {
    // Calculate energy change rate
    return metrics.physical - metrics.emotional;
  }

  private findOptimalTransition(
    currentTrack: TrackDetails,
    metrics: AudioMetrics
  ): TrackDetails | null {
    return this.currentPlaylist.find(track => 
      Math.abs(track.energy - metrics.physical) < 10 &&
      Math.abs(track.bpm - currentTrack.bpm) < 8
    ) || null;
  }
}