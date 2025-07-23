import { Router, Request, Response } from 'express';
import prisma from '../database';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';

const router = Router();

// POST /api/elements - Create a new map element
router.post('/', async (req: Request, res: Response) => {
    const { campaign_id, type, data, position, parent_element_id } = req.body;

    if (!campaign_id || !type || !position) {
        return res.status(400).json({ error: 'Missing required fields for creating an element.' });
    }

    try {
        const newElement = await prisma.mapElement.create({
            data: {
                id: nanoid(),
                campaignId: campaign_id,
                type: type,
                positionX: position.x,
                positionY: position.y,
                data: data ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
                parentElementId: parent_element_id,
            },
        });
        res.status(201).json(newElement);
    } catch (err) {
        console.error('Failed to create element:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/elements/:elementId - Update a specific map element
router.put('/:elementId', async (req: Request, res: Response) => {
  const { elementId } = req.params;
  const { data, width, height } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'No data provided for update.' });
  }

  try {
    const updatedElement = await prisma.mapElement.update({
      where: { id: elementId },
      data: {
        data: data ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
        width,
        height,
      },
    });
    res.json(updatedElement);
  } catch (err) {
    console.error(`Failed to update element ${elementId}:`, err);
    // Handle case where element is not found
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Element not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/elements/:elementId - Delete a specific map element
router.delete('/:elementId', async (req: Request, res: Response) => {
  const { elementId } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      // Delete links connected to the element first
      await tx.mapLink.deleteMany({
        where: {
          OR: [
            { sourceElementId: elementId },
            { targetElementId: elementId },
          ],
        },
      });

      // Then delete the element itself
      await tx.mapElement.delete({ where: { id: elementId } });
    });

    res.status(204).send();
  } catch (err) {
    console.error(`Failed to delete element ${elementId}:`, err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Element not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 