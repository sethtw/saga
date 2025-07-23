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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">Create New Campaign</h2>
        {error && <p className="text-error mb-form">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-form">
            <label htmlFor="name" className="form-label-mb">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="mb-form-lg">
            <label htmlFor="narrativeContext" className="form-label-mb">
              Narrative Context (Optional)
            </label>
            <textarea
              id="narrativeContext"
              rows={4}
              value={narrativeContext}
              onChange={(e) => setNarrativeContext(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="flex-end-space">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
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