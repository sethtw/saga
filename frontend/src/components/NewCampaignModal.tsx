import React, { useState } from 'react';
import { api } from '../api/api';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

/**
 * @file NewCampaignModal.tsx
 * @description A modal component for creating a new campaign.
 */

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: any) => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
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
      const newCampaign = await api.createCampaign({
        name,
        description: narrativeContext,
      });
      onCampaignCreated(newCampaign);
      onClose();
    } catch (err) {
      setError('Failed to create campaign. Please try again.');
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Give your new campaign a name to get started.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="narrativeContext" className="text-right">
                Narrative Context
              </Label>
              <Textarea
                id="narrativeContext"
                value={narrativeContext}
                onChange={(e) => setNarrativeContext(e.target.value)}
                className="col-span-3"
                placeholder="Optional: Describe the story's setting, characters, and plot."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal; 