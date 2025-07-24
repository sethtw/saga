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
    console.log('syncChanges changes:', changes);
    const response = await fetch(`/api/campaigns/${id}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    return response.json();
  },

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

  // LLM Generation Endpoints
  generateCharacter: async (prompt: string, contextId: string, campaignId: string, provider?: string) => {
    const response = await fetch('/api/generate/character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, contextId, campaignId, provider }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Character generation failed');
    }
    
    return response.json();
  },

  getAvailableProviders: async () => {
    const response = await fetch('/api/generate/providers');
    return response.json();
  },

  getUsageStats: async () => {
    const response = await fetch('/api/generate/usage-stats');
    return response.json();
  },

  testProviders: async () => {
    const response = await fetch('/api/generate/test-providers');
    return response.json();
  },
}; 