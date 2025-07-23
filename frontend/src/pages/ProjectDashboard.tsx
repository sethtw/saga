import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import NewCampaignModal from '../components/NewCampaignModal';

/**
 * @file ProjectDashboard.tsx
 * @description This component serves as the main entry point for users.
 * It displays a list of existing campaigns and provides an option to create a new one.
 */

interface Campaign {
  campaign_id: string;
  name: string;
  updated_at: string;
}

const ProjectDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
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
    setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign]);
    fetchCampaigns(); // Refetch to ensure data is fresh
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Saga Weaver</h1>
        <div>
          <Link to="/settings">
            <button className="btn-secondary mr-4">
              Settings
            </button>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            New Campaign
          </button>
        </div>
      </header>

      <main>
        <h2 className="section-title">Your Campaigns</h2>
        {loading ? (
          <p>Loading campaigns...</p>
        ) : (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <Link to={`/campaign/${campaign.campaign_id}`} key={campaign.campaign_id}>
                <div className="card-hover">
                  <h3 className="text-xl font-bold mb-2">{campaign.name}</h3>
                  <p className="text-muted">Last Modified: {new Date(campaign.updated_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
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