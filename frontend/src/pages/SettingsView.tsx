import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-purple-400">Campaign Settings</h1>
          <p className="text-gray-400 mt-2">Manage your campaign's high-level details and AI prompt templates.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Details Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">General Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-gray-300 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="campaignName"
                  name="campaignName"
                  value={formState.campaignName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="narrativeContext" className="block text-sm font-medium text-gray-300 mb-1">
                  World Description / Narrative Context
                </label>
                <textarea
                  id="narrativeContext"
                  name="narrativeContext"
                  rows={5}
                  value={formState.narrativeContext}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Prompt Templates Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">LLM Prompt Templates</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="characterPrompt" className="block text-sm font-medium text-gray-300 mb-1">
                  Character Generator Prompt
                </label>
                <textarea
                  id="characterPrompt"
                  name="characterPrompt"
                  rows={8}
                  value={formState.characterPrompt}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition duration-300"
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