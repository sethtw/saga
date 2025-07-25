import { useEffect, useRef } from 'react';
import useMapStore from '../store/mapStore';
import useSettingsStore from '../store/settingsStore';
import { type Node, type Edge } from 'reactflow';

interface AutoSaveOptions {
  onSave: (nodes: Node[], edges: Edge[]) => void;
}

export const useAutoSave = ({ onSave }: AutoSaveOptions) => {
  const { nodes, edges, areElementsDirty, setElementsDirty, getChangedElements, clearChanges } = useMapStore();
  const { autoSaveEnabled, autoSaveInterval } = useSettingsStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoSaveEnabled && areElementsDirty) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Check if there are actual changes before saving
        const changes = getChangedElements();
        const hasChanges = changes.addedNodes.length > 0 ||
          changes.updatedNodes.length > 0 ||
          changes.deletedNodeIds.length > 0 ||
          changes.addedEdges.length > 0 ||
          changes.updatedEdges.length > 0 ||
          changes.deletedEdgeIds.length > 0;

        if (hasChanges) {
          onSave(nodes, edges);
          clearChanges();
        }

        // Only reset dirty flag if auto-save is enabled
        if (autoSaveEnabled) {
          setElementsDirty(false);
        }
      }, autoSaveInterval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, areElementsDirty, autoSaveEnabled, autoSaveInterval, onSave, setElementsDirty, getChangedElements, clearChanges]);
}; 