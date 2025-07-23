import { type Node, type Edge } from 'reactflow';
import { type Campaign } from '../types/campaign';

/**
 * @file api.ts
 * @description This file contains functions for interacting with the backend API.
 */

export interface MapElements {
    nodes: Node[];
    edges: Edge[];
}

export interface SyncChanges {
    addedNodes: Node[];
    updatedNodes: Node[];
    deletedNodeIds: string[];
    addedEdges: Edge[];
    updatedEdges: Edge[];
    deletedEdgeIds: string[];
}

export const api = {
    getCampaigns: async (): Promise<Campaign[]> => {
        const response = await fetch('/api/campaigns');
        return response.json();
    },

    getCampaign: async (id: number): Promise<Campaign> => {
        const response = await fetch(`/api/campaigns/${id}`);
        return response.json();
    },

    createCampaign: async (campaign: { name: string; description: string }): Promise<Campaign> => {
        const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaign),
        });
        return response.json();
    },

    updateCampaign: async (id: number, data: { name?: string; description?: string; viewport_x?: number; viewport_y?: number; viewport_zoom?: number }): Promise<Campaign> => {
        const response = await fetch(`/api/campaigns/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    deleteCampaign: async (id: number): Promise<void> => {
        await fetch(`/api/campaigns/${id}`, {
            method: 'DELETE',
        });
    },

    getCampaignElements: async (id: number): Promise<MapElements> => {
        const response = await fetch(`/api/campaigns/${id}/elements`);
        return response.json();
    },

    saveElements: async (id: number, nodes: Node[], edges: Edge[]) => {
        const response = await fetch(`/api/campaigns/${id}/elements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, edges }),
        });
        return response.json();
    },

    syncChanges: async (id: number, changes: SyncChanges) => {
        const response = await fetch(`/api/campaigns/${id}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changes),
        });
        return response.json();
    },

    // This function is no longer needed, as element creation is now handled on the client-side
    // and persisted through the sync endpoint.
    // createElement: async (element: { campaign_id: number, type: string, data: any, position: { x: number, y: number }}) => {
    //     const response = await fetch('/api/elements', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(element),
    //     });
    //     return response.json();
    // },

    updateElement: async (id: string, data: Partial<Node>) => {
        const response = await fetch(`/api/elements/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    deleteElement: async (id: string) => {
        const response = await fetch(`/api/elements/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },
}; 