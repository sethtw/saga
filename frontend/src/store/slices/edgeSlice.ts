import { type StateCreator } from 'zustand';
import { addEdge, reconnectEdge, type Connection, type Edge } from 'reactflow';
import { type MapState, type MapActions } from '../types';

export interface EdgeSlice {
  onConnect: (connection: Connection) => void;
  setEdges: (edges: Edge[]) => void;
  deleteEdge: (edgeId: string) => void;
  onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => void;
  onEdgeUpdateStart: () => void;
  onEdgeUpdateEnd: () => void;
}

export const createEdgeSlice: StateCreator<
  MapState & MapActions,
  [],
  [],
  EdgeSlice
> = (set, get) => ({
  onConnect: (connection) => {
    const currentEdges = get().edges;
    const newEdges = addEdge({ ...connection, type: 'custom', data: { deleteEdge: get().deleteEdge } }, currentEdges);
    const changeTracker = get().changes;
    const newEdge = newEdges.find(edge => !currentEdges.includes(edge));
    if (newEdge) {
      changeTracker.addedEdges.add(newEdge.id);
    }
    set({
      edges: newEdges,
      areElementsDirty: true,
      changes: changeTracker,
    });
  },
  setEdges: (edges) => {
    set({
      edges: edges.map((edge) => ({
        ...edge,
        type: 'custom',
        data: { ...edge.data, deleteEdge: get().deleteEdge },
      })),
      areElementsDirty: true,
    });
  },
  deleteEdge: (edgeId) => {
    set(state => {
      const changes = state.changes;
      if (changes.addedEdges.has(edgeId)) {
        changes.addedEdges.delete(edgeId);
      } else {
        changes.deletedEdges.add(edgeId);
      }
      changes.updatedEdges.delete(edgeId);
      return {
        edges: state.edges.filter((e) => e.id !== edgeId),
        areElementsDirty: true,
        changes,
      };
    });
  },
  onEdgeUpdate: (oldEdge, newConnection) => {
    const currentEdges = get().edges;
    const newEdges = reconnectEdge(oldEdge, newConnection, currentEdges);
    const changes = get().changes;
    changes.updatedEdges.add(oldEdge.id);
    set({
      edges: newEdges,
      areElementsDirty: true,
      changes,
    });
  },
  onEdgeUpdateStart: () => {
    // This can be expanded to handle edge update previews
  },
  onEdgeUpdateEnd: () => {
    // This can be expanded to finalize the edge update
  },
}); 