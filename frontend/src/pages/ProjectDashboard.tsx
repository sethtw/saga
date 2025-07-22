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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-purple-400">Saga Weaver</h1>
        <div>
          <Link to="/settings">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-4 transition duration-300">
              Settings
            </button>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            New Campaign
          </button>
        </div>
      </header>

      <main>
        <h2 className="text-2xl font-semibold mb-6">Your Campaigns</h2>
        {loading ? (
          <p>Loading campaigns...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link to={`/campaign/${campaign.campaign_id}`} key={campaign.campaign_id}>
                <div
                  className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-purple-500/50 cursor-pointer transition-shadow duration-300"
                >
                  <h3 className="text-xl font-bold mb-2">{campaign.name}</h3>
                  <p className="text-gray-400">Last Modified: {new Date(campaign.updated_at).toLocaleDateString()}</p>
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