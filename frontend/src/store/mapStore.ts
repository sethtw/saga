import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  updateEdge,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnEdgeUpdateFunc,
} from 'reactflow';
import { type StateCreator } from 'zustand';

/**
 * @file mapStore.ts
 * @description Zustand store for managing the state of the map canvas,
 * including nodes and edges.
 */

type MapState = {
  nodes: Node[];
  edges: Edge[];
  menu: { x: number, y: number, node: Node } | null;
  isDirty: boolean;
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
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setMenu: (menu: { x: number, y: number, node: Node } | null) => void;
  setDirty: (isDirty: boolean) => void;
};

const stateCreator: StateCreator<MapState & MapActions> = (set, get) => {
  const actions: MapActions = {
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
        isDirty: true,
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        isDirty: true,
      });
    },
    onEdgeUpdate: (oldEdge, newConnection) => {
      set({
        edges: updateEdge(oldEdge, newConnection, get().edges),
        isDirty: true,
      });
    },
    onEdgeUpdateStart: () => {
      console.log('Edge update started');
    },
    onEdgeUpdateEnd: () => {
      console.log('Edge update ended');
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({ ...connection, type: 'custom', data: { deleteEdge: get().deleteEdge } }, get().edges),
        isDirty: true,
      });
    },
    addNode: (node) => {
      set({
        nodes: [...get().nodes, node],
        isDirty: true,
      });
    },
    setNodes: (nodes) => {
      set({ nodes });
    },
    setEdges: (edges) => {
      const { deleteEdge } = get();
      set({
        edges: edges.map((edge) => ({
          ...edge,
          type: 'custom',
          data: { ...edge.data, deleteEdge },
        })),
      });
    },
    updateNodeData: (nodeId, data) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        }),
        isDirty: true,
      });
    },
    deleteNode: (nodeId) => {
      const { nodes, edges } = get();
      const newNodes = nodes.filter((n) => n.id !== nodeId);
      const newEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      set({ nodes: newNodes, edges: newEdges, isDirty: true });
    },
    deleteEdge: (edgeId) => {
      set({
        edges: get().edges.filter((e) => e.id !== edgeId),
        isDirty: true,
      });
    },
    setMenu: (menu) => {
      set({ menu });
    },
    setDirty: (isDirty) => {
      set({ isDirty });
    }
  };

  return {
    nodes: [],
    edges: [],
    menu: null,
    isDirty: false,
    ...actions,
  };
};

const useMapStore = create<MapState & MapActions>(stateCreator);

export default useMapStore; 