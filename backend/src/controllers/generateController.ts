import { Request, Response } from 'express';
import * as generateService from '../services/generateService';
import { objectGenerationService } from '../services/generation/ObjectGenerationService';
import { llmService } from '../services/llm/llmService';
import { LLMError } from '../services/llm/types';

// Legacy character generation endpoint (for backward compatibility)
export const generateCharacter = async (req: Request, res: Response) => {
  const { prompt, contextId, campaignId, provider } = req.body;

  if (!prompt || !contextId || !campaignId) {
    return res.status(400).json({ error: 'prompt, contextId, and campaignId are required.' });
  }

  try {
    console.log('🔄 Using legacy character generation service (will migrate to generic)');
    const newElement = await generateService.generateCharacter(prompt, contextId, campaignId, provider);
    res.status(201).json(newElement);
  } catch (err: any) {
    console.error('Character generation failed:', err);
    
    // Handle LLM-specific errors with appropriate status codes
    if (err instanceof LLMError) {
      if (err.code === 'AUTH_ERROR') {
        return res.status(401).json({ error: 'LLM authentication failed. Please check API keys.' });
      }
      if (err.code === 'RATE_LIMIT') {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (err.code === 'NO_PROVIDERS_AVAILABLE') {
        return res.status(503).json({ error: 'No LLM providers are currently available.' });
      }
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// Generic object generation endpoint (new system)
export const generateObject = async (req: Request, res: Response) => {
  const { objectType } = req.params;
  const { prompt, contextId, campaignId, provider } = req.body;

  if (!prompt || !contextId || !campaignId) {
    return res.status(400).json({ error: 'prompt, contextId, and campaignId are required.' });
  }

  if (!objectType) {
    return res.status(400).json({ error: 'objectType parameter is required.' });
  }

  try {
    // Validate object type
    if (!objectGenerationService.isValidObjectType(objectType)) {
      return res.status(400).json({ 
        error: `Invalid object type: ${objectType}. Available types: ${objectGenerationService.getAvailableObjectTypes().join(', ')}` 
      });
    }

    console.log(`🎯 Generating ${objectType} using generic object system`);
    const result = await objectGenerationService.generateObject(
      objectType,
      prompt,
      contextId,
      campaignId,
      provider
    );
    
    res.status(201).json(result);
  } catch (err: any) {
    console.error(`${objectType} generation failed:`, err);
    
    // Handle LLM-specific errors with appropriate status codes
    if (err instanceof LLMError) {
      if (err.code === 'AUTH_ERROR') {
        return res.status(401).json({ error: 'LLM authentication failed. Please check API keys.' });
      }
      if (err.code === 'RATE_LIMIT') {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (err.code === 'NO_PROVIDERS_AVAILABLE') {
        return res.status(503).json({ error: 'No LLM providers are currently available.' });
      }
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// Get available object types
export const getObjectTypes = async (req: Request, res: Response) => {
  try {
    const objectTypes = objectGenerationService.getAvailableObjectTypes().map(objectType => {
      const definition = objectGenerationService.getObjectTypeDefinition(objectType);
      return {
        name: definition.name,
        displayName: definition.displayName,
        pluralName: definition.pluralName,
        category: definition.category,
        icon: definition.icon
      };
    });
    
    res.json(objectTypes);
  } catch (err: any) {
    console.error('Failed to get object types:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// Get specific object type definition
export const getObjectTypeDefinition = async (req: Request, res: Response) => {
  const { objectType } = req.params;
  
  try {
    if (!objectGenerationService.isValidObjectType(objectType)) {
      return res.status(404).json({ error: `Object type '${objectType}' not found` });
    }
    
    const definition = objectGenerationService.getObjectTypeDefinition(objectType);
    
    // Return safe definition (without internal functions)
    res.json({
      name: definition.name,
      displayName: definition.displayName,
      pluralName: definition.pluralName,
      category: definition.category,
      icon: definition.icon,
      displayFields: definition.displayFields,
      editableFields: definition.editableFields,
      defaultData: definition.defaultData,
      permissions: definition.permissions
    });
  } catch (err: any) {
    console.error(`Failed to get object type definition for ${objectType}:`, err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// Enhanced character generation using generic system
export const generateCharacterGeneric = async (req: Request, res: Response) => {
  const { prompt, contextId, campaignId, provider } = req.body;

  if (!prompt || !contextId || !campaignId) {
    return res.status(400).json({ error: 'prompt, contextId, and campaignId are required.' });
  }

  try {
    console.log('✨ Using new generic character generation system');
    const result = await objectGenerationService.generateObject(
      'character',
      prompt,
      contextId,
      campaignId,
      provider
    );
    
    res.status(201).json(result);
  } catch (err: any) {
    console.error('Generic character generation failed:', err);
    
    // Handle LLM-specific errors with appropriate status codes
    if (err instanceof LLMError) {
      if (err.code === 'AUTH_ERROR') {
        return res.status(401).json({ error: 'LLM authentication failed. Please check API keys.' });
      }
      if (err.code === 'RATE_LIMIT') {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (err.code === 'NO_PROVIDERS_AVAILABLE') {
        return res.status(503).json({ error: 'No LLM providers are currently available.' });
      }
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}; 