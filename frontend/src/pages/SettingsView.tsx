import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * @file SettingsView.tsx
 * @description This component provides a form for users to edit high-level campaign settings.
 * It could be rendered as a standalone page or within a modal.
 */

interface SettingsForm {
  campaignName: string;
  narrativeContext: string;
  characterPrompt: string;
}

const SettingsView: React.FC = () => {
  const [, toggleTheme] = useTheme();
  const [formState, setFormState] = useState<SettingsForm>({
    campaignName: 'The Lost Mines of Phandelver',
    narrativeContext: 'A classic high-fantasy world with dragons, elves, and dwarves. The story is set in the region of the Sword Coast, a place of adventure and peril.',
    characterPrompt: "Generate a TTRPG character. Return a JSON object with keys: 'name', 'description', 'stats'. Here is the context: ... Here is the user request: ...",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send the updated settings to the backend.
    console.log('Updated Settings:', formState);
    alert('Settings saved!');
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="page-title">Campaign Settings</h1>
            <p className="text-muted mt-2">Manage your campaign's high-level details and AI prompt templates.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-secondary py-2 px-4"
          >
            Toggle Theme
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Details Section */}
          <div className="card">
            <h2 className="section-subtitle">General Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="campaignName" className="form-label-mb">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="campaignName"
                  name="campaignName"
                  value={formState.campaignName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="narrativeContext" className="form-label-mb">
                  World Description / Narrative Context
                </label>
                <textarea
                  id="narrativeContext"
                  name="narrativeContext"
                  rows={5}
                  value={formState.narrativeContext}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Prompt Templates Section */}
          <div className="card">
            <h2 className="section-subtitle">LLM Prompt Templates</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="characterPrompt" className="form-label-mb">
                  Character Generator Prompt
                </label>
                <textarea
                  id="characterPrompt"
                  name="characterPrompt"
                  rows={8}
                  value={formState.characterPrompt}
                  onChange={handleInputChange}
                  className="form-input font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary py-2 px-6"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView; 