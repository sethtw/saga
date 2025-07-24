import { Request, Response } from 'express';
import * as campaignService from '../services/campaignService';
import { Prisma } from '@prisma/client';

export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.json(campaigns);
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const campaign = await campaignService.getCampaignById(parseInt(id, 10));
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    console.error(`Failed to fetch campaign with id ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Campaign name is required' });
  }
  try {
    const newCampaign = await campaignService.createCampaign(name, description);
    res.status(201).json(newCampaign);
  } catch (err) {
    console.error('Failed to create campaign:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedCampaign = await campaignService.updateCampaign(parseInt(id, 10), req.body);
    res.json(updatedCampaign);
  } catch (err) {
    console.error(`Failed to update campaign with id ${id}:`, err);
    res.status(500).json({ error: 'Failed to update campaign. It may not exist.' });
  }
};

export const getMapElements = async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  try {
    const elements = await campaignService.getMapElements(parseInt(campaignId, 10));
    res.json(elements);
  } catch (err) {
    console.error('Failed to get map elements:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const syncMapElements = async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { nodes, edges } = req.body;
  try {
    await campaignService.syncMapElements(parseInt(campaignId, 10), nodes, edges);
    res.status(200).json({ message: 'Map state synchronized successfully.' });
  } catch (err) {
    console.error('Failed to synchronize map state:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const syncMapChanges = async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  try {
    await campaignService.syncMapChanges(parseInt(campaignId, 10), req.body);
    res.status(200).json({
      message: 'Map changes synchronized successfully.',
      changes: {
        addedNodes: req.body.addedNodes?.length || 0,
        updatedNodes: req.body.updatedNodes?.length || 0,
        deletedNodes: req.body.deletedNodeIds?.length || 0,
        addedEdges: req.body.addedEdges?.length || 0,
        updatedEdges: req.body.updatedEdges?.length || 0,
        deletedEdges: req.body.deletedEdgeIds?.length || 0,
      }
    });
  } catch (err) {
    console.error('Failed to synchronize map changes:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicate element detected. Please refresh the page and try again.',
        details: err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}; 