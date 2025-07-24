import { create } from 'zustand';
import { type MapState, type MapActions } from './types';
import { createNodeSlice, type NodeSlice } from './slices/nodeSlice';
import { createEdgeSlice, type EdgeSlice } from './slices/edgeSlice';
import { createFlowSlice, type FlowSlice } from './slices/flowSlice';
import { createChangeSlice, type ChangeSlice } from './slices/changeSlice';
import { createUiSlice, type UiSlice } from './slices/uiSlice';

const useMapStore = create<
  MapState & NodeSlice & EdgeSlice & FlowSlice & ChangeSlice & UiSlice
>((set, get, api) => ({
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
  ...createNodeSlice(set, get, api),
  ...createEdgeSlice(set, get, api),
  ...createFlowSlice(set, get, api),
  ...createChangeSlice(set, get, api),
  ...createUiSlice(set, get, api),
}));

export default useMapStore; 