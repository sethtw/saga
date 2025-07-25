import { useState, useCallback } from 'react';
import { api } from '@/api/api';
import { type ObjectTypeDefinition, type GeneratedObject } from '@/types/objectTypes';
import { toast } from 'sonner';

export interface ObjectGenerationState {
  isGenerating: boolean;
  error: string | null;
  lastGenerated: GeneratedObject | null;
}

export const useObjectGeneration = () => {
  const [state, setState] = useState<ObjectGenerationState>({
    isGenerating: false,
    error: null,
    lastGenerated: null,
  });

  const generateObject = useCallback(async (
    objectType: string,
    prompt: string,
    contextId: string,
    campaignId: string,
    provider?: string
  ): Promise<GeneratedObject | null> => {
    try {
      setState(prev => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      console.log(`🎯 Generating ${objectType} using generic system`);
      
      const result = await api.generateObject(objectType, prompt, contextId, campaignId, provider);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastGenerated: result,
      }));

      // Show success toast with provider info
      const providerInfo = result.metadata.provider;
      const tokenInfo = result.metadata.tokensUsed;
      const costInfo = result.metadata.costEstimate.toFixed(4);
      
      toast.success(
        `${result.objectType.charAt(0).toUpperCase() + result.objectType.slice(1)} '${result.data.name}' generated successfully!`,
        {
          description: `${providerInfo} • ${tokenInfo} tokens • $${costInfo}`,
        }
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to generate ${objectType}`;
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));

      console.error(`${objectType} generation failed:`, error);
      
      // Show error toast
      toast.error(`${objectType.charAt(0).toUpperCase() + objectType.slice(1)} generation failed`, {
        description: errorMessage,
      });

      return null;
    }
  }, []);

  // Backward compatibility method for character generation
  const generateCharacter = useCallback(async (
    prompt: string,
    contextId: string,
    campaignId: string,
    provider?: string
  ): Promise<GeneratedObject | null> => {
    return generateObject('character', prompt, contextId, campaignId, provider);
  }, [generateObject]);

  // Generic method that can be used for any object type
  const generateByType = useCallback(async (
    objectTypeDefinition: ObjectTypeDefinition,
    prompt: string,
    contextId: string,
    campaignId: string,
    provider?: string
  ): Promise<GeneratedObject | null> => {
    return generateObject(objectTypeDefinition.name, prompt, contextId, campaignId, provider);
  }, [generateObject]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearLastGenerated = useCallback(() => {
    setState(prev => ({ ...prev, lastGenerated: null }));
  }, []);

  return {
    // State
    isGenerating: state.isGenerating,
    error: state.error,
    lastGenerated: state.lastGenerated,
    
    // Actions
    generateObject,
    generateCharacter, // Backward compatibility
    generateByType,
    clearError,
    clearLastGenerated,
  };
}; 