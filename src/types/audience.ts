export interface TrackRecommendation {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  energy: number;
  genre: string;
  confidence: number;
  reason: string;
  previewUrl?: string;
}

export interface FeedbackItem {
  id: string;
  type: 'reaction' | 'comment';
  content: string;
  timestamp: number;
}

export interface PeakMoment {
  timestamp: number;
  energy: number;
  type: 'drop' | 'buildup' | 'breakdown';
}