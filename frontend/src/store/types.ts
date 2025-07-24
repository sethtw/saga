import { type Connection, type Edge, type Node, type OnNodesChange, type OnEdgesChange, type OnEdgeUpdateFunc } from "reactflow";

// Type definitions for node data
interface AreaNodeData {
  label: string;
}

interface ItemNodeData {
  name: string;
}

interface CharacterNodeData {
  name: string;
  description: string;
}

export type NodeData = AreaNodeData | ItemNodeData | CharacterNodeData;

// Change tracking types
export interface ChangeTracker {
  addedNodes: Set<string>;
  updatedNodes: Set<string>;
  deletedNodes: Set<string>;
  addedEdges: Set<string>;
  updatedEdges: Set<string>;
  deletedEdges: Set<string>;
}

export type MapState = {
  nodes: Node[];
  edges: Edge[];
  menu: { x: number; y: number; node: Node } | null;
  areElementsDirty: boolean;
  isViewportDirty: boolean;
  interactionMode: 'drag' | 'pan';
  // Original state for change tracking
  originalNodes: Node[];
  originalEdges: Edge[];
  changes: ChangeTracker;
};

export type MapActions = {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onEdgeUpdate: OnEdgeUpdateFunc;
  onEdgeUpdateStart: () => void;
  onEdgeUpdateEnd: () => void;
  onConnect: (params: Connection) => void;
  addNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setMenu: (menu: { x: number; y: number; node: Node } | null) => void;
  setElementsDirty: (isDirty: boolean) => void;
  setViewportDirty: (isDirty: boolean) => void;
  setInteractionMode: (mode: 'drag' | 'pan') => void;
  // Change tracking methods
  loadOriginalState: (nodes: Node[], edges: Edge[]) => void;
  getChangedElements: () => {
    addedNodes: Node[];
    updatedNodes: Node[];
    deletedNodeIds: string[];
    addedEdges: Edge[];
    updatedEdges: Edge[];
    deletedEdgeIds: string[];
  };
  clearChanges: () => void;
}; 