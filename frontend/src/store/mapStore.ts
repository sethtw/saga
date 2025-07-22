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
};

const stateCreator: StateCreator<RFState> = (set, get) => ({
  nodes: [
    { id: '1', type: 'room', position: { x: 100, y: 100 }, data: { label: 'The Rusty Flagon Inn' } },
    { id: '2', type: 'room', position: { x: 300, y: 200 }, data: { label: 'Town Square' } },
  ],
  edges: [{ id: 'e1-2', source: '1', target: '2' }],
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
  }
});

const useMapStore = create<RFState>(stateCreator);

export default useMapStore; 