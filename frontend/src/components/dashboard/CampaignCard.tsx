import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types/campaign';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '../ui/button';
import { TrashIcon } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (campaignId: number) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDelete }) => {

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation() }>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            campaign and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(campaign.id)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
      <Link to={`/campaign/${campaign.id}`} key={campaign.id} className="block h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{campaign.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last Modified:{' '}
            {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

export default CampaignCard; 