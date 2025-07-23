import { Router, Request, Response } from 'express';
import prisma from '../database';
import { Prisma } from '@prisma/client';
import { Node, Edge } from '../types/map';

const router = Router();

// GET /api/campaigns - Get all campaigns
router.get('/', async (req: Request, res: Response) => {
    try {
        const campaigns = await prisma.campaign.findMany();
        res.json(campaigns);
    } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/campaigns/:id - Get a single campaign
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(campaign);
    } catch (err) {
        console.error(`Failed to fetch campaign with id ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/campaigns - Create a new campaign
router.post('/', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Campaign name is required' });
    }
    try {
        const newCampaign = await prisma.campaign.create({
            data: { name, description },
        });
        res.status(201).json(newCampaign);
    } catch (err) {
        console.error('Failed to create campaign:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/campaigns/:id - Update a campaign
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, viewport_x, viewport_y, viewport_zoom } = req.body;

    try {
        const updatedCampaign = await prisma.campaign.update({
            where: { id: parseInt(id, 10) },
            data: {
                name,
                description,
                viewportX: viewport_x,
                viewportY: viewport_y,
                viewportZoom: viewport_zoom,
            },
        });
        res.json(updatedCampaign);
    } catch (err) {
        console.error(`Failed to update campaign with id ${id}:`, err);
        // Prisma's update throws an error if the record is not found.
        res.status(500).json({ error: 'Failed to update campaign. It may not exist.' });
    }
});

// GET /api/campaigns/:campaignId/elements - Get all map elements and links for a campaign
router.get('/:campaignId/elements', async (req: Request, res: Response) => {
    const { campaignId } = req.params;
    const campaignIdInt = parseInt(campaignId, 10);

    try {
        const dbNodes = await prisma.mapElement.findMany({
            where: { campaignId: campaignIdInt },
        });
        const dbLinks = await prisma.mapLink.findMany({
            where: { campaignId: campaignIdInt },
        });

        // Transform nodes to match React Flow's expected structure
        const nodes: Node[] = dbNodes.map(n => ({
            id: n.id,
            type: n.type ?? undefined,
            position: { x: n.positionX, y: n.positionY },
            data: n.data ? n.data : null, // Prisma handles JSON parsing
            width: n.width ?? undefined,
            height: n.height ?? undefined,
            parentId: n.parentElementId ?? undefined,
        }));

        // Transform links to edges
        const edges: Edge[] = dbLinks.map(l => ({
            id: l.id,
            source: l.sourceElementId,
            target: l.targetElementId,
        }));

        res.json({ nodes, edges });
    } catch (err) {
        console.error('Failed to get map elements:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/campaigns/:campaignId/elements - Synchronize all map elements for a campaign
router.post('/:campaignId/elements', async (req: Request, res: Response) => {
    const { campaignId } = req.params;
    const { nodes, edges } = req.body as { nodes: Node[], edges: Edge[] };
    const campaignIdInt = parseInt(campaignId, 10);

    try {
        await prisma.$transaction(async (tx) => {
            // Clear existing elements and links for the campaign
            await tx.mapLink.deleteMany({ where: { campaignId: campaignIdInt } });
            await tx.mapElement.deleteMany({ where: { campaignId: campaignIdInt } });

            // Insert all nodes
            if (nodes && nodes.length > 0) {
                const nodeData = nodes.map(node => ({
                    id: node.id,
                    campaignId: campaignIdInt,
                    type: node.type,
                    positionX: node.position.x,
                    positionY: node.position.y,
                    data: node.data ? (node.data as Prisma.InputJsonValue) : Prisma.JsonNull,
                    parentElementId: node.parentId,
                    width: node.width,
                    height: node.height,
                }));
                await tx.mapElement.createMany({ data: nodeData });
            }

            // Insert all edges (links)
            if (edges && edges.length > 0) {
                const edgeData = edges.map(edge => ({
                    id: edge.id,
                    campaignId: campaignIdInt,
                    sourceElementId: edge.source,
                    targetElementId: edge.target,
                }));
                await tx.mapLink.createMany({ data: edgeData });
            }
        });

        res.status(200).json({ message: 'Map state synchronized successfully.' });
    } catch (err) {
        console.error('Failed to synchronize map state:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router; 