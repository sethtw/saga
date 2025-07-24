import { useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';

export const useTheme = () => {
    const theme = useSettingsStore((state) => state.theme);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove('light', 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
    }, [theme]);

    return theme;
}; 