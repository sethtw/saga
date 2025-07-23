import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
} from 'reactflow';
import { type StateCreator } from 'zustand';

/**
 * @file mapStore.ts
 * @description Zustand store for managing the state of the map canvas,
 * including nodes and edges.
 */

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Connection) => void;
  addNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: any) => void;
};

const stateCreator: StateCreator<RFState> = (set, get) => ({
  nodes: [], // Start with empty arrays, data will be loaded from the backend.
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // It's important to create a new object for the node data
          // to ensure that React Flow detects the change.
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },
});

const useMapStore = create<RFState>(stateCreator);

export default useMapStore; 