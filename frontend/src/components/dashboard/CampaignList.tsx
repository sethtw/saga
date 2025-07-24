import React from 'react';
import { Campaign } from '@/types/campaign';
import CampaignCard from './CampaignCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
  onNewCampaign: () => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, loading, onNewCampaign }) => {
  if (loading) {
    return (
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
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No campaigns yet!</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Get started by creating a new campaign.
        </p>
        <Button onClick={onNewCampaign}>Create New Campaign</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
};

export default CampaignList; 