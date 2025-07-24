import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
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
  );
};

export default CampaignCard; 