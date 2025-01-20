import { TrackRecommendation } from '../../types/audience';
import { AudioMetrics } from '../../types/audio';

interface PlaylistGenerationConfig {
  targetDuration: number;  // minutes
  energyCurve: 'build' | 'sustain' | 'wave';
  genrePreferences: string[];
  bpmRange: { min: number; max: number };
}

export class PlaylistGenerator {
  generatePlaylist(
    availableTracks: TrackRecommendation[],
    currentMetrics: AudioMetrics,
    config: PlaylistGenerationConfig
  ): TrackRecommendation[] {
    const playlist: TrackRecommendation[] = [];
    let currentEnergy = currentMetrics.physical;
    let currentBPM = 128; // Default starting BPM
    let totalDuration = 0;

    while (totalDuration < config.targetDuration * 60) {
      const targetEnergy = this.calculateTargetEnergy(
        totalDuration / (config.targetDuration * 60),
        config.energyCurve,
        currentEnergy
      );

      const nextTrack = this.findBestTrack(
        availableTracks,
        {
          currentBPM,
          targetEnergy,
          currentEnergy,
          genrePreferences: config.genrePreferences,
          bpmRange: config.bpmRange
        },
        playlist
      );

      if (!nextTrack) break;

      playlist.push(nextTrack);
      currentEnergy = nextTrack.energy;
      currentBPM = nextTrack.bpm;
      totalDuration += (nextTrack.duration || 180); // Default 3 minutes if duration unknown
    }

    return playlist;
  }

  private calculateTargetEnergy(
    progress: number,
    curve: PlaylistGenerationConfig['energyCurve'],
    startEnergy: number
  ): number {
    switch (curve) {
      case 'build':
        return Math.min(startEnergy + (progress * 40), 100);
      case 'sustain':
        return startEnergy;
      case 'wave':
        return startEnergy + Math.sin(progress * Math.PI * 2) * 20;
      default:
        return startEnergy;
    }
  }

  private findBestTrack(
    tracks: TrackRecommendation[],
    criteria: {
      currentBPM: number;
      targetEnergy: number;
      currentEnergy: number;
      genrePreferences: string[];
      bpmRange: { min: number; max: number };
    },
    currentPlaylist: TrackRecommendation[]
  ): TrackRecommendation | null {
    const usedTrackIds = new Set(currentPlaylist.map(t => t.id));

    return tracks
      .filter(track => 
        !usedTrackIds.has(track.id) &&
        track.bpm >= criteria.bpmRange.min &&
        track.bpm <= criteria.bpmRange.max &&
        Math.abs(track.bpm - criteria.currentBPM) <= 8 // BPM compatibility
      )
      .map(track => ({
        track,
        score: this.calculateTrackScore(track, criteria)
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ track }) => track)[0] || null;
  }

  private calculateTrackScore(
    track: TrackRecommendation,
    criteria: {
      currentBPM: number;
      targetEnergy: number;
      currentEnergy: number;
      genrePreferences: string[];
    }
  ): number {
    const energyMatch = 1 - Math.abs(track.energy - criteria.targetEnergy) / 100;
    const bpmMatch = 1 - Math.abs(track.bpm - criteria.currentBPM) / 16;
    const genreMatch = criteria.genrePreferences.includes(track.genre) ? 1 : 0.5;

    return (
      energyMatch * 0.4 +
      bpmMatch * 0.3 +
      genreMatch * 0.3
    );
  }
}