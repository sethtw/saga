import React, { useState } from 'react';
import api from '../api/api';

/**
 * @file NewCampaignModal.tsx
 * @description A modal component for creating a new campaign.
 */

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: any) => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ isOpen, onClose, onCampaignCreated }) => {
  const [name, setName] = useState('');
  const [narrativeContext, setNarrativeContext] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError('Campaign name is required.');
      return;
    }

    try {
      const response = await api.post('/campaigns', {
        name,
        narrative_context: narrativeContext,
        user_id: 1, // This would be dynamic in a real app
      });
      onCampaignCreated(response.data);
      onClose();
    } catch (err) {
      setError('Failed to create campaign. Please try again.');
      console.error(err);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Create New Campaign</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="narrativeContext" className="block text-sm font-medium text-gray-300 mb-1">
              Narrative Context (Optional)
            </label>
            <textarea
              id="narrativeContext"
              rows={4}
              value={narrativeContext}
              onChange={(e) => setNarrativeContext(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCampaignModal; 