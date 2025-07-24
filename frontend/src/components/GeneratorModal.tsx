import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useLLMProviders } from '@/hooks/useLLMProviders';

/**
 * @file GeneratorModal.tsx
 * @description A modal for generating content via an LLM.
 */

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, provider?: string) => void;
  title: string;
}

const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
}) => {
  const [prompt, setPrompt] = useState('');
  const { 
    selectedProvider, 
    setSelectedProvider, 
    getAvailableProviders, 
    getProviderDisplayName, 
    getProviderCostInfo,
    loading 
  } = useLLMProviders();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, selectedProvider);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Enter a prompt to generate a new element.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A grumpy dwarf blacksmith with a secret."
              />
            </div>
            
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="provider">LLM Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableProviders().map((provider) => {
                    const costInfo = getProviderCostInfo(provider.name);
                    return (
                      <SelectItem key={provider.name} value={provider.name}>
                        <div className="flex items-center justify-between w-full">
                          <span className="flex-1">{getProviderDisplayName(provider.name)}</span>
                          <div className="flex gap-2 ml-2">
                            <Badge variant="secondary" className="text-xs">
                              {costInfo.cost}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {costInfo.description}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedProvider && (
                <p className="text-sm text-muted-foreground">
                  {getProviderCostInfo(selectedProvider).description} • {getProviderCostInfo(selectedProvider).cost}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!prompt.trim() || !selectedProvider}>
              Generate with {selectedProvider ? getProviderDisplayName(selectedProvider).split(' ')[0] : 'LLM'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratorModal; 