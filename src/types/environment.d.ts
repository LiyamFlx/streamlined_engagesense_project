/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string
  readonly VITE_ENABLE_ML_FEATURES: string
  readonly VITE_ENABLE_AUDIO_RECORDING: string
  readonly VITE_AUDIO_BUFFER_SIZE: string
  readonly VITE_ANALYSIS_INTERVAL: string
  readonly VITE_API_URL: string
  readonly VITE_WEBSOCKET_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}