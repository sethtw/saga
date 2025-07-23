import { useEffect, useRef } from 'react';
import useMapStore from '../store/mapStore';
import useSettingsStore from '../store/settingsStore';
import { type Node, type Edge } from 'reactflow';

interface AutoSaveOptions {
    onSave: (nodes: Node[], edges: Edge[]) => void;
}

export const useAutoSave = ({ onSave }: AutoSaveOptions) => {
    const { nodes, edges, isDirty, setDirty } = useMapStore();
    const { autoSaveEnabled, autoSaveInterval } = useSettingsStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (autoSaveEnabled && isDirty) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                onSave(nodes, edges);
                setDirty(false);
            }, autoSaveInterval);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [nodes, edges, isDirty, autoSaveEnabled, autoSaveInterval, onSave, setDirty]);
}; 