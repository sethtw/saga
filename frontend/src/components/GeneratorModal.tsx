import React, { useState, useEffect } from 'react';
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
import { Separator } from './ui/separator';
import { useLLMProviders } from '@/hooks/useLLMProviders';
import { useObjectTypes } from '@/hooks/useObjectTypes';
import { type ObjectTypeDefinition } from '@/types/objectTypes';

/**
 * @file GeneratorModal.tsx
 * @description A modal for generating content via an LLM with support for multiple object types.
 */

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, provider?: string, objectType?: string) => void;
  title?: string;
  defaultObjectType?: string; // For backward compatibility
  showObjectTypeSelector?: boolean; // Enable/disable object type selection
}

const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  defaultObjectType = 'character',
  showObjectTypeSelector = true,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedObjectType, setSelectedObjectType] = useState(defaultObjectType);
  
  const { 
    selectedProvider, 
    setSelectedProvider, 
    getAvailableProviders, 
    getProviderDisplayName, 
    getProviderCostInfo,
    loading: providersLoading 
  } = useLLMProviders();

  const {
    objectTypes,
    loading: objectTypesLoading,
    error: objectTypesError,
    getAvailableObjectTypes,
    getObjectTypeDisplayName,
    getObjectTypePluralName,
    getObjectTypeIcon,
  } = useObjectTypes();

  // Reset selected object type when defaultObjectType changes
  useEffect(() => {
    setSelectedObjectType(defaultObjectType);
  }, [defaultObjectType]);

  // Auto-select first available object type if current selection becomes invalid
  useEffect(() => {
    const availableTypes = getAvailableObjectTypes();
    if (availableTypes.length > 0 && !availableTypes.find(t => t.name === selectedObjectType)) {
      setSelectedObjectType(availableTypes[0].name);
    }
  }, [objectTypes, selectedObjectType, getAvailableObjectTypes]);

  const currentObjectType = objectTypes.find(t => t.name === selectedObjectType);
  const availableObjectTypes = getAvailableObjectTypes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, selectedProvider, selectedObjectType);
  };

  const getObjectTypeDescription = (objectType: ObjectTypeDefinition) => {
    const categoryDescriptions = {
      'character': 'NPCs, heroes, and other sentient beings',
      'location': 'Places, areas, and geographical features', 
      'item': 'Equipment, artifacts, and magical items',
      'lore': 'History, legends, and worldbuilding elements'
    };
    return categoryDescriptions[objectType.category] || 'TTRPG content';
  };

  const generateTitle = () => {
    if (title) return title;
    
    if (currentObjectType) {
      return `Generate ${currentObjectType.displayName}`;
    }
    
    return 'Generate Content';
  };

  const generateDescription = () => {
    if (currentObjectType) {
      return `Create a new ${currentObjectType.displayName.toLowerCase()} for your campaign using AI generation.`;
    }
    
    return 'Enter a prompt to generate new content for your campaign.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{generateTitle()}</DialogTitle>
            <DialogDescription>
              {generateDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Object Type Selection */}
            {showObjectTypeSelector && availableObjectTypes.length > 1 && (
              <>
                <div className="grid grid-cols-1 items-center gap-4">
                  <Label htmlFor="objectType">Content Type</Label>
                  <Select 
                    value={selectedObjectType} 
                    onValueChange={setSelectedObjectType}
                    disabled={objectTypesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableObjectTypes.map((objectType) => (
                        <SelectItem key={objectType.name} value={objectType.name}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getObjectTypeIcon(objectType.name)}</span>
                            <div className="flex flex-col">
                              <span className="font-medium">{objectType.displayName}</span>
                              <span className="text-xs text-muted-foreground">
                                {getObjectTypeDescription(objectType)}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentObjectType && (
                    <p className="text-sm text-muted-foreground">
                      Generating {currentObjectType.displayName.toLowerCase()} • {getObjectTypeDescription(currentObjectType)}
                    </p>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Prompt Input */}
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  currentObjectType?.name === 'character' 
                    ? "e.g., A grumpy dwarf blacksmith with a secret."
                    : currentObjectType?.name === 'location'
                    ? "e.g., A mysterious tavern at a crossroads."
                    : currentObjectType?.name === 'item'
                    ? "e.g., An ancient sword with a glowing rune."
                    : "Describe what you want to generate..."
                }
                className="min-h-[80px]"
              />
            </div>
            
            {/* LLM Provider Selection */}
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="provider">LLM Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={providersLoading}>
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

            {/* Error Display */}
            {objectTypesError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                Failed to load object types: {objectTypesError}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                !prompt.trim() || 
                !selectedProvider || 
                !selectedObjectType ||
                objectTypesLoading ||
                providersLoading
              }
            >
              Generate {currentObjectType?.displayName || 'Content'} with {selectedProvider ? getProviderDisplayName(selectedProvider).split(' ')[0] : 'LLM'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratorModal; 