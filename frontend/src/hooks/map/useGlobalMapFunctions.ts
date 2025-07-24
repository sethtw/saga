
import { useEffect } from 'react';
import { useReactFlow, type Node } from 'reactflow';
import useMapStore from '@/store/mapStore';
import { api } from '@/api/api';

export const useGlobalMapFunctions = (campaignId: string) => {
  const { getViewport } = useReactFlow();

  useEffect(() => {
    (window as any).saveMapWithViewport = async () => {
      try {
        const { getNodes } = (window as any).reactFlowStore.getState();
        const { edges } = useMapStore.getState();

        const nodesToSave = getNodes().map(({ id, type, position, data, parentId, width, height }: Node) => ({
          id,
          type,
          position,
          data,
          parentId,
          width,
          height,
        }));

        await api.saveElements(parseInt(campaignId), nodesToSave, edges);

        const viewport = getViewport();
        await api.updateCampaign(parseInt(campaignId), {
          viewport_x: viewport.x,
          viewport_y: viewport.y,
          viewport_zoom: viewport.zoom,
        });

        return true;
      } catch (error) {
        console.error('Failed to save map state:', error);
        throw error;
      }
    };

    (window as any).saveViewport = async () => {
      try {
        const viewport = getViewport();
        await api.updateCampaign(parseInt(campaignId), {
          viewport_x: viewport.x,
          viewport_y: viewport.y,
          viewport_zoom: viewport.zoom,
        });
        return true;
      } catch (error) {
        console.error('Failed to save viewport:', error);
        throw error;
      }
    };
  }, [campaignId, getViewport]);
}; 