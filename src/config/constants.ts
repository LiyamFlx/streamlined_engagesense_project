// Audio Analysis Settings
export const AUDIO_SETTINGS = {
  FFT_SIZE: parseInt(import.meta.env.VITE_AUDIO_BUFFER_SIZE || '2048'),
  SMOOTHING_TIME_CONSTANT: 0.8,
  MIN_DECIBELS: -90,
  MAX_DECIBELS: -10,
  SAMPLE_RATE: 44100,
  UPDATE_INTERVAL: parseInt(import.meta.env.VITE_ANALYSIS_INTERVAL || '100')
} as const;

// Engagement Thresholds
export const ENGAGEMENT_THRESHOLDS = {
  PHYSICAL: { WARNING: 30, CRITICAL: 20 },
  EMOTIONAL: { WARNING: 35, CRITICAL: 25 },
  MENTAL: { WARNING: 40, CRITICAL: 30 },
  SPIRITUAL: { WARNING: 35, CRITICAL: 25 }
} as const;

// Feature Flags
export const FEATURES = {
  ML_ENABLED: import.meta.env.VITE_ENABLE_ML_FEATURES === 'true',
  AUDIO_RECORDING: import.meta.env.VITE_ENABLE_AUDIO_RECORDING === 'true'
} as const;

// API Configuration
export const API = {
  BASE_URL: import.meta.env.VITE_API_URL,
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL
} as const;

// Cache Settings
export const CACHE = {
  MAX_HISTORY_LENGTH: 50,
  AUDIO_CACHE_SIZE: 20,
  AUDIO_CACHE_TTL: 3600000 // 1 hour
} as const;