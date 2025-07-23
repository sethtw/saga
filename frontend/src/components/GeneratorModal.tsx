import React, { useState } from 'react';

/**
 * @file GeneratorModal.tsx
 * @description A modal for generating content via an LLM.
 */

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  title: string;
}

const GeneratorModal: React.FC<GeneratorModalProps> = ({ isOpen, onClose, onSubmit, title }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-form-lg">
            <label htmlFor="prompt" className="form-label-mb">
              Your Prompt
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="form-input"
              placeholder="e.g., A grumpy dwarf blacksmith with a secret."
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
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratorModal; 