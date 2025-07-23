import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex justify-between items-center py-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaign Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your campaign's high-level details and AI prompt templates.
          </p>
        </div>
        <Button onClick={toggleTheme} variant="outline">
          Toggle Theme
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              High-level details about your campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                type="text"
                id="campaignName"
                name="campaignName"
                value={formState.campaignName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="narrativeContext">
                World Description / Narrative Context
              </Label>
              <Textarea
                id="narrativeContext"
                name="narrativeContext"
                rows={5}
                value={formState.narrativeContext}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LLM Prompt Templates</CardTitle>
            <CardDescription>
              Customize the prompts used for AI generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="characterPrompt">
                Character Generator Prompt
              </Label>
              <Textarea
                id="characterPrompt"
                name="characterPrompt"
                rows={8}
                value={formState.characterPrompt}
                onChange={handleInputChange}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView; 