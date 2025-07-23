import React, { useState, useEffect } from 'react';
import { type Node } from 'reactflow';
import api from '../api/api';

interface EditElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
  node: Node | null;
}

const EditElementModal: React.FC<EditElementModalProps> = ({ isOpen, onClose, onSave, node }) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.put(`/elements/${node.id}`, { data: formData });
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
          <>
            <div className="mb-form">
              <label htmlFor="label" className="form-label">Room Name</label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label || ''}
                onChange={handleInputChange}
                className="form-input-block"
              />
            </div>
          </>
        );
      case 'character':
        return (
          <>
            <div className="mb-form">
              <label htmlFor="name" className="form-label">Character Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="form-input-block"
              />
            </div>
            <div className="mb-form">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description || ''}
                onChange={handleInputChange}
                className="form-input-block"
              />
            </div>
          </>
        );
      default:
        return <p className="text-muted">No editable fields for this element type.</p>;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="modal-title">Edit Element</h2>
          {error && <p className="text-error text-sm mb-form">{error}</p>}
          
          {renderFormFields()}

          <div className="flex-end-space mt-form">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditElementModal; 