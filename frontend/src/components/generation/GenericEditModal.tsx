import React, { useState, useEffect } from 'react';
import { type Node } from 'reactflow';
import { api } from '@/api/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useObjectTypes } from '@/hooks/useObjectTypes';
import { ObjectTypeDefinition, EditableFieldConfig } from '@/types/objectTypes';

interface GenericEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: Record<string, any>) => void;
  node: Node | null;
}

const GenericEditModal: React.FC<GenericEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  node,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [definition, setDefinition] = useState<ObjectTypeDefinition | null>(null);
  const { getObjectTypeDefinition } = useObjectTypes();

  useEffect(() => {
    if (node?.data?.objectType) {
      const fetchDefinition = async () => {
        const def = await getObjectTypeDefinition(node.data.objectType);
        setDefinition(def);
      };
      fetchDefinition();
      setFormData(node.data);
    }
  }, [node, getObjectTypeDefinition]);

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
      await api.updateElement(node.id, { data: formData });
      onSave(node.id, formData);
      onClose();
    } catch (err) {
      setError('Failed to update element. Please try again.');
      console.error(err);
    }
  };

  const renderField = (field: EditableFieldConfig) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.key}
            name={field.key}
            value={formData[field.key] || ''}
            onChange={handleInputChange}
            className="col-span-3"
            required={field.required}
          />
        );
      case 'text':
      default:
        return (
          <Input
            id={field.key}
            name={field.key}
            value={formData[field.key] || ''}
            onChange={handleInputChange}
            className="col-span-3"
            required={field.required}
          />
        );
    }
  };

  const renderFormFields = () => {
    if (!definition || !definition.editableFields) {
      return (
        <p className="text-muted-foreground p-4">
          No editable fields for this element type.
        </p>
      );
    }

    return (
      <div className="grid gap-4 py-4">
        {definition.editableFields.map((field) => (
          <div key={field.key} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.key} className="text-right">
              {field.label}
            </Label>
            {renderField(field)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit {definition?.displayName || 'Element'}</DialogTitle>
            <DialogDescription>
              Make changes to your {definition?.displayName?.toLowerCase() || 'element'} here.
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

export default GenericEditModal; 