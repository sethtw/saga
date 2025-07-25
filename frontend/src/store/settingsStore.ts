import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = "light" | "dark" | "system";

interface SettingsState {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  theme: Theme;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setTheme: (theme: Theme) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoSaveEnabled: false,
      autoSaveInterval: 5000,
      theme: "system",
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
    }
  )
);

export default useSettingsStore; 