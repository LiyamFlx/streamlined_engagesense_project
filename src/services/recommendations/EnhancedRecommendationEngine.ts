import { AudioMetrics } from '../../types/audio';
import { TrackDetails } from '../../types/spotify';
import { SentimentAnalyzer } from '../sentiment/SentimentAnalyzer';
import { CrowdAnalysisModel } from '../../ml/models/crowdAnalysis';

interface RecommendationContext {
  currentMetrics: AudioMetrics;
  recentHistory: AudioMetrics[];
  currentTrack: TrackDetails | null;
  crowdMood: string;
  timeOfDay: number;
}

export class EnhancedRecommendationEngine {
  private sentimentAnalyzer: SentimentAnalyzer;
  private crowdAnalysis: CrowdAnalysisModel;
  private recentRecommendations: Set<string> = new Set();
  private readonly HISTORY_LIMIT = 50;
  private readonly NOVELTY_WEIGHT = 0.2;

  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.crowdAnalysis = new CrowdAnalysisModel();
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.sentimentAnalyzer.initialize(),
      this.crowdAnalysis.initialize()
    ]);
  }

  async getRecommendations(
    context: RecommendationContext,
    availableTracks: TrackDetails[]
  ): Promise<TrackDetails[]> {
    const sentiment = await this.sentimentAnalyzer.analyzeSentiment({
      timeStamp: Date.now(),
      frequency: new Float32Array(),
      amplitude: new Float32Array(),
      metrics: context.currentMetrics
    });

    const crowdPrediction = await this.crowdAnalysis.predictCrowdResponse({
      timeStamp: Date.now(),
      frequency: new Float32Array(),
      amplitude: new Float32Array(),
      metrics: context.currentMetrics
    });

    const scoredTracks = await this.scoreTracksForContext(
      availableTracks,
      context,
      sentiment,
      crowdPrediction
    );

    // Filter out recently played tracks
    const filteredTracks = scoredTracks.filter(
      track => !this.recentRecommendations.has(track.id)
    );

    // Update recent recommendations cache
    filteredTracks.slice(0, 5).forEach(track => {
      this.recentRecommendations.add(track.id);
      if (this.recentRecommendations.size > this.HISTORY_LIMIT) {
        const firstItem = this.recentRecommendations.values().next().value;
        this.recentRecommendations.delete(firstItem);
      }
    });

    return filteredTracks.slice(0, 10);
  }

  private async scoreTracksForContext(
    tracks: TrackDetails[],
    context: RecommendationContext,
    sentiment: any,
    crowdPrediction: any
  ): Promise<TrackDetails[]> {
    const scoredTracks = await Promise.all(
      tracks.map(async track => {
        const scores = await this.calculateScores(track, context, sentiment, crowdPrediction);
        const finalScore = this.computeWeightedScore(scores);

        return {
          ...track,
          score: finalScore,
          confidence: scores.confidence
        };
      })
    );

    return scoredTracks.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private async calculateScores(
    track: TrackDetails,
    context: RecommendationContext,
    sentiment: any,
    crowdPrediction: any
  ): Promise<{
    energy: number;
    mood: number;
    flow: number;
    novelty: number;
    confidence: number;
  }> {
    const energyScore = this.calculateEnergyScore(track, context, crowdPrediction);
    const moodScore = this.calculateMoodScore(track, sentiment);
    const flowScore = this.calculateFlowScore(track, context);
    const noveltyScore = this.calculateNoveltyScore(track);

    return {
      energy: energyScore,
      mood: moodScore,
      flow: flowScore,
      novelty: noveltyScore,
      confidence: (energyScore + moodScore + flowScore) / 3
    };
  }

  private calculateEnergyScore(
    track: TrackDetails,
    context: RecommendationContext,
    crowdPrediction: any
  ): number {
    const targetEnergy = crowdPrediction.energyPrediction;
    const currentEnergy = context.currentMetrics.physical;
    
    // Calculate optimal energy progression
    const energyDelta = targetEnergy - currentEnergy;
    const optimalNextEnergy = currentEnergy + (energyDelta * 0.3);
    
    return 1 - Math.abs(track.energy - optimalNextEnergy) / 100;
  }

  private calculateMoodScore(track: TrackDetails, sentiment: any): number {
    const moodMap: Record<string, number> = {
      positive: 1,
      neutral: 0.5,
      negative: 0
    };

    const sentimentScore = moodMap[sentiment.mood] || 0.5;
    const trackMoodScore = track.valence || 0.5;

    return 1 - Math.abs(sentimentScore - trackMoodScore);
  }

  private calculateFlowScore(track: TrackDetails, context: RecommendationContext): number {
    if (!context.currentTrack) return 1;

    const bpmDiff = Math.abs(track.bpm - context.currentTrack.bpm);
    const keyCompatibility = this.calculateKeyCompatibility(
      track.key,
      context.currentTrack.key
    );

    return (
      (1 - bpmDiff / 20) * 0.6 +
      keyCompatibility * 0.4
    );
  }

  private calculateNoveltyScore(track: TrackDetails): number {
    return this.recentRecommendations.has(track.id) ? 0 : 1;
  }

  private calculateKeyCompatibility(key1: string, key2: string): number {
    // Implement Camelot wheel compatibility
    return 0.8; // Placeholder
  }

  private computeWeightedScore(scores: {
    energy: number;
    mood: number;
    flow: number;
    novelty: number;
  }): number {
    return (
      scores.energy * 0.4 +
      scores.mood * 0.2 +
      scores.flow * 0.2 +
      scores.novelty * this.NOVELTY_WEIGHT
    );
  }
}