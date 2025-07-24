import { Request, Response } from 'express';
import * as elementService from '../services/elementService';
import { Prisma } from '@prisma/client';

export const createElement = async (req: Request, res: Response) => {
  const { campaign_id, type, data, position, parent_element_id } = req.body;

  if (!campaign_id || !type || !position) {
    return res.status(400).json({ error: 'Missing required fields for creating an element.' });
  }

  try {
    const newElement = await elementService.createElement(
      campaign_id,
      type,
      position,
      data,
      parent_element_id
    );
    res.status(201).json(newElement);
  } catch (err) {
    console.error('Failed to create element:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateElement = async (req: Request, res: Response) => {
  const { elementId } = req.params;
  const { data, width, height } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'No data provided for update.' });
  }

  try {
    const updatedElement = await elementService.updateElement(elementId, data, width, height);
    res.json(updatedElement);
  } catch (err) {
    console.error(`Failed to update element ${elementId}:`, err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Element not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteElement = async (req: Request, res: Response) => {
  const { elementId } = req.params;

  try {
    await elementService.deleteElement(elementId);
    res.status(204).send();
  } catch (err) {
    console.error(`Failed to delete element ${elementId}:`, err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Element not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}; 