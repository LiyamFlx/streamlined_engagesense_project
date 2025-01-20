import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  sensitivity: number;
  noiseThreshold: number;
  updateInterval: number;
  theme: 'light' | 'dark';
  updateSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sensitivity: 50,
      noiseThreshold: 30,
      updateInterval: 100,
      theme: 'dark',
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings }))
    }),
    {
      name: 'settings-storage'
    }
  )
);