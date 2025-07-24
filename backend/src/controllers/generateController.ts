import { Request, Response } from 'express';
import * as generateService from '../services/generateService';

export const generateCharacter = async (req: Request, res: Response) => {
  const { prompt, contextId, campaignId } = req.body;

  if (!prompt || !contextId || !campaignId) {
    return res.status(400).json({ error: 'prompt, contextId, and campaignId are required.' });
  }

  try {
    const newElement = await generateService.generateCharacter(prompt, contextId, campaignId);
    res.status(201).json(newElement);
  } catch (err) {
    console.error('Character generation failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 