export interface TrackFeatures {
  id: string;
  energy: number;
  tempo: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  key: number;
  mode: number;
  timeSignature: number;
}

export interface ListeningContext {
  currentTrack: TrackFeatures | null;
  recentTracks: TrackFeatures[];
  currentEnergy: number;
  crowdMood: 'energetic' | 'calm' | 'focused' | 'euphoric';
  timeOfDay: number;
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  favoriteGenres: string[];
  dislikedGenres: string[];
  energyPreference: number;
  varietyPreference: number;
  recentSkips: string[];
}

export interface RecommendationScore {
  energyMatch: number;
  tempoMatch: number;
  moodMatch: number;
  genreMatch: number;
  noveltyScore: number;
  final: number;
}