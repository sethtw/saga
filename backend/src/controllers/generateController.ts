import { Request, Response } from 'express';
import * as generateService from '../services/generateService';
import { llmService } from '../services/llm/llmService';
import { LLMError } from '../services/llm/types';

export const generateCharacter = async (req: Request, res: Response) => {
  const { prompt, contextId, campaignId, provider } = req.body;

  if (!prompt || !contextId || !campaignId) {
    return res.status(400).json({ error: 'prompt, contextId, and campaignId are required.' });
  }

  try {
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

export const getProviders = async (req: Request, res: Response) => {
  try {
    const providers = llmService.getAvailableProviders();
    res.json({ providers });
  } catch (err: any) {
    console.error('Failed to get providers:', err);
    res.status(500).json({ error: 'Failed to retrieve available providers' });
  }
};

export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const stats = llmService.getUsageStats();
    res.json(stats);
  } catch (err: any) {
    console.error('Failed to get usage stats:', err);
    res.status(500).json({ error: 'Failed to retrieve usage statistics' });
  }
};

export const testProviders = async (req: Request, res: Response) => {
  try {
    const results = await llmService.testProviders();
    res.json({ results });
  } catch (err: any) {
    console.error('Failed to test providers:', err);
    res.status(500).json({ error: 'Failed to test providers' });
  }
}; 