import React, { useState, useEffect } from 'react';
import { type Node } from 'reactflow';
import api from '../api/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface EditElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
  node: Node | null;
}

const EditElementModal: React.FC<EditElementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  node,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  if (!isOpen || !node) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.put(`/elements/${node.id}`, {
        data: formData,
      });
      onSave(node.id, response.data.data);
      onClose();
    } catch (err) {
      setError('Failed to update element. Please try again.');
      console.error(err);
    }
  };

  const renderFormFields = () => {
    switch (node.type) {
      case 'room':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Room Name
              </Label>
              <Input
                id="label"
                name="label"
                value={formData.label || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
        );
      case 'character':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Character Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
        );
      default:
        return (
          <p className="text-muted-foreground p-4">
            No editable fields for this element type.
          </p>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Element</DialogTitle>
            <DialogDescription>
              Make changes to your map element here.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {renderFormFields()}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditElementModal; 