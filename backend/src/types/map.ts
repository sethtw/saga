/**
 * @file backend/src/types/map.ts
 * @description Defines the types for map elements used in the backend.
 * These are kept separate from frontend-specific types (e.g., from React Flow)
 * to avoid backend dependencies on frontend libraries.
 */

export interface Node {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: any;
  parentId?: string;
  width?: number;
  height?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
} 