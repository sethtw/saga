import { useEffect } from 'react';

type Hotkey = [string, (e: KeyboardEvent) => void, { preventDefault?: boolean, keydown?: boolean, keyup?: boolean }?];

export function useHotkeys(hotkeys: Hotkey[], element: HTMLElement | null = document.body) {
    useEffect(() => {
        if (!element) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            for (const [key, handler, options] of hotkeys) {
                if ((options?.keydown ?? true) && e.key.toLowerCase() === key.toLowerCase()) {
                    if (options?.preventDefault) {
                        e.preventDefault();
                    }
                    handler(e);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            for (const [key, handler, options] of hotkeys) {
                if (options?.keyup && e.key.toLowerCase() === key.toLowerCase()) {
                    if (options?.preventDefault) {
                        e.preventDefault();
                    }
                    handler(e);
                }
            }
        };

        element.addEventListener('keydown', handleKeyDown as EventListener);
        element.addEventListener('keyup', handleKeyUp as EventListener);

        return () => {
            element.removeEventListener('keydown', handleKeyDown as EventListener);
            element.removeEventListener('keyup', handleKeyUp as EventListener);
        };
    }, [hotkeys, element]);
} 