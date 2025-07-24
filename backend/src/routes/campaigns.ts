import { Router, Request, Response } from 'express';
import prisma from '../database';
import { Prisma } from '@prisma/client';
import { Node, Edge } from '../types/map';

const router = Router();

/**
 * @route GET /api/campaigns
 * @description Get all campaigns.
 * @returns {Array<Campaign>} 200 - An array of all campaigns.
 * @returns {object} 500 - An error object if the fetch fails.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany();
    res.json(campaigns);
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/campaigns/:id
 * @description Get a single campaign by its ID.
 * @param {string} id - The ID of the campaign to retrieve.
 * @returns {Campaign} 200 - The campaign object.
 * @returns {object} 404 - An error object if the campaign is not found.
 * @returns {object} 500 - An error object if the fetch fails.
 */
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

/**
 * @route POST /api/campaigns
 * @description Create a new campaign.
 * @param {object} request.body - The campaign data.
 * @param {string} request.body.name - The name of the campaign.
 * @param {string} [request.body.description] - The description of the campaign.
 * @returns {Campaign} 201 - The newly created campaign object.
 * @returns {object} 400 - An error object if the campaign name is missing.
 * @returns {object} 500 - An error object if the creation fails.
 */
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

/**
 * @route PUT /api/campaigns/:id
 * @description Update an existing campaign's details.
 * @param {string} id - The ID of the campaign to update.
 * @param {object} request.body - The campaign data to update.
 * @returns {Campaign} 200 - The updated campaign object.
 * @returns {object} 500 - An error object if the update fails.
 */
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

/**
 * @route GET /api/campaigns/:campaignId/elements
 * @description Get all map elements (nodes and edges) for a specific campaign.
 * @param {string} campaignId - The ID of the campaign.
 * @returns {object} 200 - An object containing arrays of nodes and edges.
 * @returns {object} 500 - An error object if the fetch fails.
 */
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

/**
 * @route POST /api/campaigns/:campaignId/elements
 * @description Synchronize all map elements for a campaign by replacing them.
 * This is a full sync, deleting all existing elements and replacing them with the provided ones.
 * @param {string} campaignId - The ID of the campaign.
 * @param {object} request.body - The new state of the map.
 * @param {Array<Node>} request.body.nodes - The array of nodes.
 * @param {Array<Edge>} request.body.edges - The array of edges.
 * @returns {object} 200 - A success message.
 * @returns {object} 500 - An error object if the synchronization fails.
 */
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

/**
 * @route POST /api/campaigns/:campaignId/sync
 * @description Efficiently synchronize map changes for a campaign.
 * This endpoint handles incremental updates, additions, and deletions of map elements.
 * @param {string} campaignId - The ID of the campaign.
 * @param {object} request.body - The changes to the map.
 * @returns {object} 200 - A success message with a summary of changes.
 * @returns {object} 409 - An error for duplicate elements.
 * @returns {object} 500 - An error object if the synchronization fails.
 */
router.post('/:campaignId/sync', async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const {
    addedNodes,
    updatedNodes,
    deletedNodeIds,
    addedEdges,
    updatedEdges,
    deletedEdgeIds
  } = req.body;
  const campaignIdInt = parseInt(campaignId, 10);

  try {
    await prisma.$transaction(async (tx) => {
      // Delete nodes that were removed
      if (deletedNodeIds && deletedNodeIds.length > 0) {
        // First delete any links connected to these nodes
        await tx.mapLink.deleteMany({
          where: {
            OR: [
              { sourceElementId: { in: deletedNodeIds } },
              { targetElementId: { in: deletedNodeIds } },
            ],
          },
        });

        // Then delete the nodes
        await tx.mapElement.deleteMany({
          where: { id: { in: deletedNodeIds } },
        });
      }

      // Delete edges that were removed
      if (deletedEdgeIds && deletedEdgeIds.length > 0) {
        await tx.mapLink.deleteMany({
          where: { id: { in: deletedEdgeIds } },
        });
      }

      // Update existing nodes
      if (updatedNodes && updatedNodes.length > 0) {
        for (const node of updatedNodes) {
          const nodeData = node as Node;
          await tx.mapElement.update({
            where: { id: nodeData.id },
            data: {
              type: nodeData.type,
              positionX: nodeData.position.x,
              positionY: nodeData.position.y,
              data: nodeData.data ? (nodeData.data as Prisma.InputJsonValue) : Prisma.JsonNull,
              parentElementId: nodeData.parentId,
              width: nodeData.width,
              height: nodeData.height,
            },
          });
        }
      }

      // Update existing edges
      if (updatedEdges && updatedEdges.length > 0) {
        for (const edge of updatedEdges) {
          const edgeData = edge as Edge;
          await tx.mapLink.update({
            where: { id: edgeData.id },
            data: {
              sourceElementId: edgeData.source,
              targetElementId: edgeData.target,
            },
          });
        }
      }

      // Add new nodes
      if (addedNodes && addedNodes.length > 0) {
        // Check for existing nodes to avoid unique constraint violations
        const existingNodeIds = await tx.mapElement.findMany({
          where: {
            id: { in: addedNodes.map((node: Node) => node.id) },
            campaignId: campaignIdInt
          },
          select: { id: true }
        });

        const existingIds = new Set(existingNodeIds.map(n => n.id));
        const trulyNewNodes = addedNodes.filter((node: Node) => !existingIds.has(node.id));

        if (trulyNewNodes.length > 0) {
          const nodeData = trulyNewNodes.map((node: Node) => ({
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
      }

      // Add new edges
      if (addedEdges && addedEdges.length > 0) {
        // Check for existing edges to avoid unique constraint violations
        const existingEdgeIds = await tx.mapLink.findMany({
          where: {
            id: { in: addedEdges.map((edge: Edge) => edge.id) },
            campaignId: campaignIdInt
          },
          select: { id: true }
        });

        const existingIds = new Set(existingEdgeIds.map(e => e.id));
        const trulyNewEdges = addedEdges.filter((edge: Edge) => !existingIds.has(edge.id));

        if (trulyNewEdges.length > 0) {
          const edgeData = trulyNewEdges.map((edge: Edge) => ({
            id: edge.id,
            campaignId: campaignIdInt,
            sourceElementId: edge.source,
            targetElementId: edge.target,
          }));
          await tx.mapLink.createMany({ data: edgeData });
        }
      }
    });

    res.status(200).json({
      message: 'Map changes synchronized successfully.',
      changes: {
        addedNodes: addedNodes?.length || 0,
        updatedNodes: updatedNodes?.length || 0,
        deletedNodes: deletedNodeIds?.length || 0,
        addedEdges: addedEdges?.length || 0,
        updatedEdges: updatedEdges?.length || 0,
        deletedEdges: deletedEdgeIds?.length || 0,
      }
    });
  } catch (err) {
    console.error('Failed to synchronize map changes:', err);

    // Handle specific Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          error: 'Duplicate element detected. Please refresh the page and try again.',
          details: err.message
        });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 