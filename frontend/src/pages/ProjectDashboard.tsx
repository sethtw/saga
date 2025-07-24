import React, { useState } from 'react';
import NewCampaignModal from '@/components/NewCampaignModal';
import { useCampaigns } from '@/hooks/dashboard/useCampaigns';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CampaignList from '@/components/dashboard/CampaignList';

const ProjectDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { campaigns, loading, addCampaign, deleteCampaign } = useCampaigns();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <DashboardHeader onNewCampaign={() => setIsModalOpen(true)} />

      <main className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Campaigns</h2>
        <CampaignList 
          campaigns={campaigns} 
          loading={loading} 
          onNewCampaign={() => setIsModalOpen(true)}
          onDelete={deleteCampaign}
        />
      </main>

      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCampaignCreated={addCampaign}
      />
    </div>
  );
};

export default ProjectDashboard; 