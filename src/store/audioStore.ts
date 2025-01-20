import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioData, AudioMetrics } from '../types/audio';

interface AudioState {
  audioData: AudioData | null;
  metrics: AudioMetrics[];
  isRecording: boolean;
  error: Error | null;
  setAudioData: (data: AudioData | null) => void;
  addMetrics: (metrics: AudioMetrics) => void;
  setRecording: (isRecording: boolean) => void;
  setError: (error: Error | null) => void;
  clearHistory: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      audioData: null,
      metrics: [],
      isRecording: false,
      error: null,
      setAudioData: (data) => set({ audioData: data }),
      addMetrics: (metrics) => 
        set((state) => ({ 
          metrics: [...state.metrics.slice(-100), metrics] 
        })),
      setRecording: (isRecording) => set({ isRecording }),
      setError: (error) => set({ error }),
      clearHistory: () => set({ metrics: [] })
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({ metrics: state.metrics.slice(-100) })
    }
  )
);