import { type StateCreator } from 'zustand';
import { type Node, type Edge } from 'reactflow';
import { type MapState, type MapActions } from '../types';

export interface ChangeSlice {
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
  setElementsDirty: (isDirty: boolean) => void;
  setViewportDirty: (isDirty: boolean) => void;
}

export const createChangeSlice: StateCreator<
  MapState & MapActions,
  [],
  [],
  ChangeSlice
> = (set, get) => ({
  loadOriginalState: (nodes, edges) => {
    set({
      originalNodes: JSON.parse(JSON.stringify(nodes)),
      originalEdges: JSON.parse(JSON.stringify(edges)),
      changes: {
        addedNodes: new Set(),
        updatedNodes: new Set(),
        deletedNodes: new Set(),
        addedEdges: new Set(),
        updatedEdges: new Set(),
        deletedEdges: new Set(),
      },
      areElementsDirty: false,
      isViewportDirty: false,
    });
  },
  getChangedElements: () => {
    const { nodes, edges, originalNodes, originalEdges, changes } = get();

    const addedNodes = nodes.filter(node => changes.addedNodes.has(node.id));
    const updatedNodes = nodes.filter(node => changes.updatedNodes.has(node.id));
    const deletedNodeIds = Array.from(changes.deletedNodes);

    const addedEdges = edges.filter(edge => changes.addedEdges.has(edge.id));
    const updatedEdges = edges.filter(edge => changes.updatedEdges.has(edge.id));
    const deletedEdgeIds = Array.from(changes.deletedEdges);

    return {
      addedNodes,
      updatedNodes,
      deletedNodeIds,
      addedEdges,
      updatedEdges,
      deletedEdgeIds,
    };
  },
  clearChanges: () => {
    set(state => ({
      ...state,
      originalNodes: JSON.parse(JSON.stringify(state.nodes)),
      originalEdges: JSON.parse(JSON.stringify(state.edges)),
      changes: {
        addedNodes: new Set(),
        updatedNodes: new Set(),
        deletedNodes: new Set(),
        addedEdges: new Set(),
        updatedEdges: new Set(),
        deletedEdges: new Set(),
      },
      areElementsDirty: false,
    }));
  },
  setElementsDirty: (isDirty) => {
    set({ areElementsDirty: isDirty });
  },
  setViewportDirty: (isDirty) => {
    set({ isViewportDirty: isDirty });
  },
}); 