export interface QueueItem {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration: number;
  score: number;
}

export interface PlayerState {
  currentTrack: QueueItem | null;
  queue: QueueItem[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  error: Error | null;
}

export interface PlayerAnalytics {
  trackStarted: (track: QueueItem) => void;
  trackCompleted: (track: QueueItem) => void;
  trackSkipped: (track: QueueItem) => void;
  errorOccurred: (error: Error) => void;
}