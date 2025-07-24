import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GearIcon } from '@radix-ui/react-icons';

interface DashboardHeaderProps {
  onNewCampaign: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNewCampaign }) => {
  return (
    <header className="flex justify-between items-center py-4">
      <h1 className="text-3xl font-bold">Saga Weaver</h1>
      <div className="flex items-center gap-4">
        <Link to="/settings">
          <Button variant="outline" size="icon">
            <GearIcon className="h-5 w-5" />
          </Button>
        </Link>
        <Button onClick={onNewCampaign}>New Campaign</Button>
      </div>
    </header>
  );
};

export default DashboardHeader; 