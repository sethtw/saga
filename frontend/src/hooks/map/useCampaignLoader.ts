
import { useEffect, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { api } from '@/api/api';

export const useCampaignLoader = (campaignId: string | undefined) => {
  const { setNodes, setEdges, loadOriginalState } = useMapStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!campaignId) return;
      setIsLoading(true);
      try {
        const { nodes, edges } = await api.getCampaignElements(parseInt(campaignId));
        setNodes(nodes);
        setEdges(edges);
        loadOriginalState(nodes, edges);
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [campaignId, setNodes, setEdges, loadOriginalState]);

  return isLoading;
}; 