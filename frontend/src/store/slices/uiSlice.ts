import { type StateCreator } from 'zustand';
import { type Node } from 'reactflow';
import { type MapState, type MapActions } from '../types';

export interface UiSlice {
  setMenu: (menu: { x: number; y: number; node: Node } | null) => void;
  setInteractionMode: (mode: 'drag' | 'pan') => void;
}

export const createUiSlice: StateCreator<
  MapState & MapActions,
  [],
  [],
  UiSlice
> = (set) => ({
  setMenu: (menu) => {
    set({ menu });
  },
  setInteractionMode: (mode) => {
    set({ interactionMode: mode });
  },
}); 