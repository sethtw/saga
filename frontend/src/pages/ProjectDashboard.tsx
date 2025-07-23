import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import NewCampaignModal from '../components/NewCampaignModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GearIcon } from '@radix-ui/react-icons';
import { Campaign } from '../types/campaign';

/**
 * @file ProjectDashboard.tsx
 * @description This component serves as the main entry point for users.
 * It displays a list of existing campaigns and provides an option to create a new one.
 */

const ProjectDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const fetchedCampaigns = await api.getCampaigns();
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns((prevCampaigns) => [...prevCampaigns, newCampaign]);
    fetchCampaigns(); // Refetch to ensure data is fresh
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold">Saga Weaver</h1>
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <Button variant="outline" size="icon">
              <GearIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>New Campaign</Button>
        </div>
      </header>

      <main className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Campaigns</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {campaigns.map((campaign) => (
              <Link to={`/campaign/${campaign.id}`} key={campaign.id}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>{campaign.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last Modified:{' '}
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No campaigns yet!</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                  Get started by creating a new campaign.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>Create New Campaign</Button>
          </div>
        )}
      </main>

      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  );
};

export default ProjectDashboard; 