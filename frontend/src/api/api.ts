import { type Node, type Edge } from 'reactflow';
import { type Campaign } from '../types/campaign';

/**
 * @file api.ts
 * @description This file contains functions for interacting with the backend API.
 */

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

    getCampaignMap: async (id: number) => {
        const response = await fetch(`/api/campaigns/${id}/map`);
        return response.json();
    },

    saveMap: async (id: number, nodes: Node[], edges: Edge[]) => {
        const response = await fetch(`/api/campaigns/${id}/map`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, edges }),
        });
        return response.json();
    },

    createElement: async (element: { campaign_id: number; type: string; data: any; position: { x: number; y: number } }) => {
        const response = await fetch('/api/elements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(element),
        });
        return response.json();
    },

    updateElement: async (id: number, data: any) => {
        const response = await fetch(`/api/elements/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    deleteElement: async (id: number) => {
        const response = await fetch(`/api/elements/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },
}; 