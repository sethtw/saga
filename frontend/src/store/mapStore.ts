import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  reconnectEdge,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnEdgeUpdateFunc,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import { type StateCreator } from 'zustand';
import useHistoryStore from './historyStore';
import { nanoid } from 'nanoid';

/**
 * @file mapStore.ts
 * @description Zustand store for managing the state of the map canvas,
 * including nodes and edges with change tracking for efficient synchronization.
 */

// Type definitions for node data
interface RoomNodeData {
  label: string;
}

interface ItemNodeData {
  name: string;
}

interface CharacterNodeData {
  name: string;
  description: string;
}

type NodeData = RoomNodeData | ItemNodeData | CharacterNodeData;

// Change tracking types
interface ChangeTracker {
  addedNodes: Set<string>;
  updatedNodes: Set<string>;
  deletedNodes: Set<string>;
  addedEdges: Set<string>;
  updatedEdges: Set<string>;
  deletedEdges: Set<string>;
}

type MapState = {
  nodes: Node[];
  edges: Edge[];
  menu: { x: number, y: number, node: Node } | null;
  areElementsDirty: boolean;
  isViewportDirty: boolean;
  interactionMode: 'drag' | 'pan';
  // Original state for change tracking
  originalNodes: Node[];
  originalEdges: Edge[];
  changes: ChangeTracker;
};

type MapActions = {
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
  setMenu: (menu: { x: number, y: number, node: Node } | null) => void;
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

const stateCreator: StateCreator<MapState & MapActions> = (set, get) => {
  const actions: MapActions = {
    onNodesChange: (nodeChanges) => {
      const currentNodes = get().nodes;
      const newNodes = applyNodeChanges(nodeChanges, currentNodes);
      const changeTracker = get().changes;

      // Track changes based on the type of change
      changeTracker.addedNodes = new Set(changeTracker.addedNodes);
      changeTracker.updatedNodes = new Set(changeTracker.updatedNodes);
      changeTracker.deletedNodes = new Set(changeTracker.deletedNodes);
      
      nodeChanges.forEach(change => {
        if (change.type === 'add') {
          changeTracker.addedNodes.add(change.item.id);
        } else if (change.type === 'remove') {
          changeTracker.deletedNodes.add(change.id);
          // Remove from added/updated if it was newly added/updated
          changeTracker.addedNodes.delete(change.id);
          changeTracker.updatedNodes.delete(change.id);
        } else if (change.type === 'position' || change.type === 'dimensions') {
          changeTracker.updatedNodes.add(change.id);
        }
      });
      
      set({
        nodes: newNodes,
        areElementsDirty: true,
        changes: changeTracker,
      });
    },
    onEdgesChange: (edgeChanges) => {
      const currentEdges = get().edges;
      const newEdges = applyEdgeChanges(edgeChanges, currentEdges);
      const changeTracker = get().changes;
      
      // Track edge changes
      changeTracker.addedEdges = new Set(changeTracker.addedEdges);
      changeTracker.updatedEdges = new Set(changeTracker.updatedEdges);
      changeTracker.deletedEdges = new Set(changeTracker.deletedEdges);
      
      edgeChanges.forEach(change => {
        if (change.type === 'add') {
          changeTracker.addedEdges.add(change.item.id);
        } else if (change.type === 'remove') {
          changeTracker.deletedEdges.add(change.id);
          changeTracker.addedEdges.delete(change.id);
          changeTracker.updatedEdges.delete(change.id);
        }
      });
      
      set({
        edges: newEdges,
        areElementsDirty: true,
        changes: changeTracker,
      });
    },
    onEdgeUpdate: (oldEdge, newConnection) => {
      const currentEdges = get().edges;
      const newEdges = reconnectEdge(oldEdge, newConnection, currentEdges);
      const changes = get().changes;
      
      // Track edge update
      changes.updatedEdges.add(oldEdge.id);
      
      set({
        edges: newEdges,
        areElementsDirty: true,
        changes,
      });
    },
    onEdgeUpdateStart: () => {
      console.log('Edge update started');
    },
    onEdgeUpdateEnd: () => {
      console.log('Edge update ended');
    },
    onConnect: (connection) => {
      const currentEdges = get().edges;
      const newEdges = addEdge({ ...connection, type: 'custom', data: { deleteEdge: get().deleteEdge } }, currentEdges);
      const changeTracker = get().changes;
      
      // Track new edge - connection doesn't have an id, it will be generated by addEdge
      // We'll track it after the edge is created
      const newEdge = newEdges[newEdges.length - 1];
      if (newEdge) {
        changeTracker.addedEdges.add(newEdge.id);
      }
      
      set({
        edges: newEdges,
        areElementsDirty: true,
        changes: changeTracker,
      });
    },
    addNode: (node) => {
      const currentNodes = get().nodes;
      const changes = get().changes;
      
      // useHistoryStore.getState().addPresentToPast(`Node "${node.data.label || node.data.name || node.id}" Added`);
      
      changes.addedNodes.add(node.id);
      
      set({
        nodes: [...currentNodes, node],
        areElementsDirty: true,
        changes,
      });
    },
    setNodes: (nodes) => {
      set({ nodes });
    },
    setEdges: (edges) => {
      const { deleteEdge, changes } = get();
      set({
        edges: edges.map((edge) => ({
          ...edge,
          type: 'custom',
          data: { ...edge.data, deleteEdge },
        })),
        areElementsDirty: true,
        changes,
      });
    },
    updateNodeData: (nodeId, data) => {
        set(state => {
            const nodeToUpdate = state.nodes.find((node: Node) => node.id === nodeId);
            if (nodeToUpdate) {
                const updatedNodes = state.nodes.map((node: Node) =>
                    node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
                );

                const originalNode = state.originalNodes.find((node: Node) => node.id === nodeId);
                if (originalNode && JSON.stringify(originalNode.data) !== JSON.stringify(data)) {
                    state.changes.updatedNodes.add(nodeId);
                }

                return { ...state, nodes: updatedNodes };
            }
            return state;
        });
    },
    deleteNode: (nodeId) => {
        set(state => {
            const nodeToDelete = state.nodes.find((n: Node) => n.id === nodeId);
            if (!nodeToDelete) return state;
            
            const newNodes = state.nodes.filter((n: Node) => n.id !== nodeId);
            const newEdges = state.edges.filter((e: Edge) => e.source !== nodeId && e.target !== nodeId);

            if (state.changes.addedNodes.has(nodeId)) {
                state.changes.addedNodes.delete(nodeId);
            } else {
                state.changes.deletedNodes.add(nodeId);
            }

            state.changes.updatedNodes.delete(nodeId);

            return { ...state, nodes: newNodes, edges: newEdges };
        });
    },
    deleteEdge: (edgeId) => {
      const currentEdges = get().edges;
      const edge = currentEdges.find(e => e.id === edgeId);
      const changes = get().changes;
      
      if (changes.addedEdges.has(edgeId)) {
        changes.addedEdges.delete(edgeId);
      } else {
        changes.deletedEdges.add(edgeId);
      }
      
      changes.updatedEdges.delete(edgeId);
      
      set({
        edges: currentEdges.filter((e) => e.id !== edgeId),
        areElementsDirty: true,
        changes,
      });
    },
    setMenu: (menu) => {
      set({ menu });
    },
    setElementsDirty: (isDirty) => {
      set({ areElementsDirty: isDirty });
    },
    setViewportDirty: (isDirty) => {
        set({ isViewportDirty: isDirty });
    },
    setInteractionMode: (mode) => {
        set({ interactionMode: mode });
    },
    loadOriginalState: (nodes: Node[], edges: Edge[]) => {
      set({
        originalNodes: [...nodes],
        originalEdges: [...edges],
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
      
      // Get added nodes (nodes that don't exist in original)
      const addedNodes = nodes.filter(node => 
        !originalNodes.find(original => original.id === node.id)
      );
      
      // Get updated nodes (nodes that exist in both but have changes)
      const updatedNodes = nodes.filter(node => {
        const original = originalNodes.find(original => original.id === node.id);
        if (!original) return false;
        
        // Check if position, data, or other properties changed
        return (
          original.position.x !== node.position.x ||
          original.position.y !== node.position.y ||
          JSON.stringify(original.data) !== JSON.stringify(node.data) ||
          original.width !== node.width ||
          original.height !== node.height ||
          original.parentId !== node.parentId
        );
      });
      
      // Get added edges
      const addedEdges = edges.filter(edge => 
        !originalEdges.find(original => original.id === edge.id)
      );
      
      // Get updated edges
      const updatedEdges = edges.filter(edge => {
        const original = originalEdges.find(original => original.id === edge.id);
        if (!original) return false;
        
        return (
          original.source !== edge.source ||
          original.target !== edge.target
        );
      });
      
      // Filter out any nodes/edges that are marked as deleted from the added/updated lists
      const deletedNodeIds = Array.from(changes.deletedNodes);
      const deletedEdgeIds = Array.from(changes.deletedEdges);
      
      const finalAddedNodes = addedNodes.filter(node => !deletedNodeIds.includes(node.id));
      const finalUpdatedNodes = updatedNodes.filter(node => !deletedNodeIds.includes(node.id));
      const finalAddedEdges = addedEdges.filter(edge => !deletedEdgeIds.includes(edge.id));
      const finalUpdatedEdges = updatedEdges.filter(edge => !deletedEdgeIds.includes(edge.id));
      
      return {
        addedNodes: finalAddedNodes,
        updatedNodes: finalUpdatedNodes,
        deletedNodeIds,
        addedEdges: finalAddedEdges,
        updatedEdges: finalUpdatedEdges,
        deletedEdgeIds,
      };
    },
    clearChanges: () => {
      set({
        changes: {
          addedNodes: new Set(),
          updatedNodes: new Set(),
          deletedNodes: new Set(),
          addedEdges: new Set(),
          updatedEdges: new Set(),
          deletedEdges: new Set(),
        },
        areElementsDirty: false,
      });
    },
  };

  return {
    nodes: [],
    edges: [],
    menu: null,
    areElementsDirty: false,
    isViewportDirty: false,
    interactionMode: 'drag',
    originalNodes: [],
    originalEdges: [],
    changes: {
      addedNodes: new Set(),
      updatedNodes: new Set(),
      deletedNodes: new Set(),
      addedEdges: new Set(),
      updatedEdges: new Set(),
      deletedEdges: new Set(),
    },
    ...actions,
  };
};

const useMapStore = create<MapState & MapActions>(stateCreator);

export default useMapStore; 