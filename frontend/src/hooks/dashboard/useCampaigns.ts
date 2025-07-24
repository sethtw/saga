import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/api/api';
import { Campaign } from '@/types/campaign';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchingRef = useRef(false);

  const fetchCampaigns = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setLoading(true);
      const fetchedCampaigns = await api.getCampaigns();
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = (newCampaign: Campaign) => {
    setCampaigns((prevCampaigns) => [...prevCampaigns, newCampaign]);
    fetchCampaigns();
  };

  const deleteCampaign = async (campaignId: number) => {
    console.log('Deleting campaign:', campaignId);
    try {
      await api.deleteCampaign(campaignId);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  return { campaigns, loading, addCampaign, deleteCampaign, refetch: fetchCampaigns };
}; 