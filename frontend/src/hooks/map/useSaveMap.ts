
import { useCallback, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { api } from '@/api/api';
import { toast } from 'sonner';
import { useAutoSave } from '../useAutoSave';

export const useSaveMap = (campaignId: string | undefined) => {
  const { getChangedElements, clearChanges, areElementsDirty, isViewportDirty, setViewportDirty } = useMapStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!campaignId) return;
    setIsSaving(true);
    const promise = () => new Promise<void>(async (resolve, reject) => {
      try {
        const changes = getChangedElements();
        if (areElementsDirty) {
          await api.syncChanges(parseInt(campaignId), changes);
          clearChanges();
        }

        if (isViewportDirty) {
          await (window as any).saveViewport();
          setViewportDirty(false);
        }

        resolve();
      } catch (error) {
        console.error('Failed to save map state:', error);
        reject(error);
      } finally {
        setIsSaving(false);
      }
    });

    toast.promise(promise, {
      loading: 'Saving map state...',
      success: 'Map state saved successfully!',
      error: 'Failed to save map state.',
    });
  }, [campaignId, getChangedElements, clearChanges, areElementsDirty, isViewportDirty, setViewportDirty]);

  useAutoSave({
    onSave: async () => {
      if (campaignId) {
        try {
          const changes = getChangedElements();

          if (changes.addedNodes.length > 0 ||
            changes.updatedNodes.length > 0 ||
            changes.deletedNodeIds.length > 0 ||
            changes.addedEdges.length > 0 ||
            changes.updatedEdges.length > 0 ||
            changes.deletedEdgeIds.length > 0) {

            await api.syncChanges(parseInt(campaignId), changes);
            clearChanges();
            toast.success('Map saved!');
          }
        } catch (error) {
          console.error('Failed to sync changes:', error);
          toast.error('Failed to save map.');
        }
      }
    },
  });

  return { isSaving, handleSave };
}; 