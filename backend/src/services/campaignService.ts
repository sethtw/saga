import prisma from '../database';
import { Prisma } from '@prisma/client';
import { Node, Edge } from '../types/map';

export const getAllCampaigns = () => {
  return prisma.campaign.findMany();
};

export const getCampaignById = (id: number) => {
  return prisma.campaign.findUnique({
    where: { id },
  });
};

export const createCampaign = (name: string, description?: string) => {
  return prisma.campaign.create({
    data: { name, description },
  });
};

export const updateCampaign = (
  id: number,
  data: {
    name?: string;
    description?: string;
    viewport_x?: number;
    viewport_y?: number;
    viewport_zoom?: number;
  }
) => {
  return prisma.campaign.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      viewportX: data.viewport_x,
      viewportY: data.viewport_y,
      viewportZoom: data.viewport_zoom,
    },
  });
};

export const getMapElements = async (campaignId: number) => {
  const dbNodes = await prisma.mapElement.findMany({
    where: { campaignId },
  });
  const dbLinks = await prisma.mapLink.findMany({
    where: { campaignId },
  });

  const nodes: Node[] = dbNodes.map(n => ({
    id: n.id,
    type: n.type ?? undefined,
    position: { x: n.positionX, y: n.positionY },
    data: n.data ? n.data : null,
    width: n.width ?? undefined,
    height: n.height ?? undefined,
    parentId: n.parentElementId ?? undefined,
  }));

  const edges: Edge[] = dbLinks.map(l => ({
    id: l.id,
    source: l.sourceElementId,
    target: l.targetElementId,
  }));

  return { nodes, edges };
};

export const syncMapElements = (campaignId: number, nodes: Node[], edges: Edge[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.mapLink.deleteMany({ where: { campaignId } });
    await tx.mapElement.deleteMany({ where: { campaignId } });

    if (nodes && nodes.length > 0) {
      const nodeData = nodes.map(node => ({
        id: node.id,
        campaignId: campaignId,
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

    if (edges && edges.length > 0) {
      const edgeData = edges.map(edge => ({
        id: edge.id,
        campaignId: campaignId,
        sourceElementId: edge.source,
        targetElementId: edge.target,
      }));
      await tx.mapLink.createMany({ data: edgeData });
    }
  });
};

export const syncMapChanges = async (campaignId: number, changes: any) => {
    const {
        addedNodes,
        updatedNodes,
        deletedNodeIds,
        addedEdges,
        updatedEdges,
        deletedEdgeIds
    } = changes;

    return prisma.$transaction(async (tx) => {
    if (deletedNodeIds && deletedNodeIds.length > 0) {
      await tx.mapLink.deleteMany({
        where: {
          OR: [
            { sourceElementId: { in: deletedNodeIds } },
            { targetElementId: { in: deletedNodeIds } },
          ],
        },
      });
      await tx.mapElement.deleteMany({ where: { id: { in: deletedNodeIds } } });
    }

    if (deletedEdgeIds && deletedEdgeIds.length > 0) {
      await tx.mapLink.deleteMany({ where: { id: { in: deletedEdgeIds } } });
    }

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

    if (addedNodes && addedNodes.length > 0) {
      const existingNodeIds = await tx.mapElement.findMany({
        where: {
          id: { in: addedNodes.map((node: Node) => node.id) },
          campaignId: campaignId
        },
        select: { id: true }
      });
      const existingIds = new Set(existingNodeIds.map(n => n.id));
      const trulyNewNodes = addedNodes.filter((node: Node) => !existingIds.has(node.id));

      if (trulyNewNodes.length > 0) {
        const nodeData = trulyNewNodes.map((node: Node) => ({
          id: node.id,
          campaignId: campaignId,
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

    if (addedEdges && addedEdges.length > 0) {
      const existingEdgeIds = await tx.mapLink.findMany({
        where: {
          id: { in: addedEdges.map((edge: Edge) => edge.id) },
          campaignId: campaignId
        },
        select: { id: true }
      });
      const existingIds = new Set(existingEdgeIds.map(e => e.id));
      const trulyNewEdges = addedEdges.filter((edge: Edge) => !existingIds.has(edge.id));

      if (trulyNewEdges.length > 0) {
        const edgeData = trulyNewEdges.map((edge: Edge) => ({
          id: edge.id,
          campaignId: campaignId,
          sourceElementId: edge.source,
          targetElementId: edge.target,
        }));
        await tx.mapLink.createMany({ data: edgeData });
      }
    }
  });
}; 