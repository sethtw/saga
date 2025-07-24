import { type StateCreator } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, type OnNodesChange, type OnEdgesChange } from 'reactflow';
import { type MapState, type MapActions } from '../types';

export interface FlowSlice {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
}

export const createFlowSlice: StateCreator<
  MapState & MapActions,
  [],
  [],
  FlowSlice
> = (set, get) => ({
  onNodesChange: (nodeChanges) => {
    const currentNodes = get().nodes;
    const newNodes = applyNodeChanges(nodeChanges, currentNodes);
    const changeTracker = get().changes;

    changeTracker.addedNodes = new Set(changeTracker.addedNodes);
    changeTracker.updatedNodes = new Set(changeTracker.updatedNodes);
    changeTracker.deletedNodes = new Set(changeTracker.deletedNodes);

    nodeChanges.forEach(change => {
      if (change.type === 'add') {
        changeTracker.addedNodes.add(change.item.id);
      } else if (change.type === 'remove') {
        changeTracker.deletedNodes.add(change.id);
        changeTracker.addedNodes.delete(change.id);
        changeTracker.updatedNodes.delete(change.id);
      } else if (change.type === 'position' || change.type === 'dimensions') {
        if (!changeTracker.addedNodes.has(change.id)) {
          changeTracker.updatedNodes.add(change.id);
        }
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
}); 