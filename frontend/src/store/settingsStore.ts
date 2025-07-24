import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoSaveEnabled: true,
      autoSaveInterval: 5000,
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
    }),
    {
      name: 'settings-storage',
    }
  )
);

export default useSettingsStore; 