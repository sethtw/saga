import { type StateCreator } from 'zustand';
import { type Node } from 'reactflow';
import { type MapState, type MapActions, type NodeData } from '../types';

export interface NodeSlice {
  addNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
}

export const createNodeSlice: StateCreator<
  MapState & MapActions,
  [],
  [],
  NodeSlice
> = (set, get) => ({
  addNode: (node) => {
    const currentNodes = get().nodes;
    const changes = get().changes;
    changes.addedNodes.add(node.id);
    set({
      nodes: [...currentNodes, node],
      areElementsDirty: true,
      changes,
    });
  },
  setNodes: (nodes) => {
    set({ nodes, areElementsDirty: false });
  },
  updateNodeData: (nodeId, data) => {
    set(state => {
      const nodeToUpdate = state.nodes.find((node) => node.id === nodeId);
      if (!nodeToUpdate) return state;

      const updatedData = { ...nodeToUpdate.data, ...data };
      const updatedNodes = state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: updatedData } : node
      );

      const changes = state.changes;
      const originalNode = state.originalNodes.find((node) => node.id === nodeId);

      if (!changes.addedNodes.has(nodeId)) {
        if (originalNode && JSON.stringify(originalNode.data) !== JSON.stringify(updatedData)) {
          changes.updatedNodes.add(nodeId);
        } else if (originalNode && JSON.stringify(originalNode.data) === JSON.stringify(updatedData)) {
          changes.updatedNodes.delete(nodeId);
        }
      }

      return { nodes: updatedNodes, areElementsDirty: true, changes };
    });
  },
  deleteNode: (nodeId) => {
    set(state => {
      const nodeToDelete = state.nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return state;

      const newNodes = state.nodes.filter((n) => n.id !== nodeId);
      const newEdges = state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

      const changes = state.changes;
      if (changes.addedNodes.has(nodeId)) {
        changes.addedNodes.delete(nodeId);
      } else {
        changes.deletedNodes.add(nodeId);
      }
      changes.updatedNodes.delete(nodeId);

      return { nodes: newNodes, edges: newEdges, areElementsDirty: true, changes };
    });
  },
}); 