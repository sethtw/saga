import { useEffect } from 'react';

type Hotkey = [string, (e: KeyboardEvent) => void, { preventDefault?: boolean }?];

export function useHotkeys(hotkeys: Hotkey[], element: HTMLElement | null = document.body) {
    useEffect(() => {
        if (!element) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            for (const [key, handler, options] of hotkeys) {
                if (e.key === key) {
                    if (options?.preventDefault) {
                        e.preventDefault();
                    }
                    handler(e);
                }
            }
        };

        element.addEventListener('keydown', handleKeyDown as EventListener);

        return () => {
            element.removeEventListener('keydown', handleKeyDown as EventListener);
        };
    }, [hotkeys, element]);
} 