import { create } from 'zustand';
import { type Node, type Edge } from 'reactflow';
import useMapStore from './mapStore';

interface HistoryEntry {
    nodes: Node[];
    edges: Edge[];
    description: string;
}

interface HistoryState {
    past: HistoryEntry[];
    future: HistoryEntry[];
}

interface HistoryActions {
    undo: () => void;
    redo: () => void;
    addPresentToPast: (description: string) => void;
    clearHistory: () => void;
}

const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
    past: [],
    future: [],
    addPresentToPast: (description: string) => {
        const { nodes, edges } = useMapStore.getState();
        set(state => ({
            past: [...state.past, { nodes, edges, description }],
            future: [], // Clear future when a new state is added
        }));
    },
    undo: () => {
        const { past } = get();
        if (past.length === 0) return;

        const { nodes: presentNodes, edges: presentEdges } = useMapStore.getState();
        const previousState = past[past.length - 1];

        set({
            past: past.slice(0, past.length - 1),
            future: [{ nodes: presentNodes, edges: presentEdges, description: 'Present State' }, ...get().future],
        });

        useMapStore.getState().setNodes(previousState.nodes);
        useMapStore.getState().setEdges(previousState.edges);
    },
    redo: () => {
        const { future } = get();
        if (future.length === 0) return;

        const { nodes: presentNodes, edges: presentEdges } = useMapStore.getState();
        const nextState = future[0];

        set({
            past: [...get().past, { nodes: presentNodes, edges: presentEdges, description: 'Present State' }],
            future: future.slice(1),
        });

        useMapStore.getState().setNodes(nextState.nodes);
        useMapStore.getState().setEdges(nextState.edges);
    },
    clearHistory: () => {
        set({ past: [], future: [] });
    }
}));

export default useHistoryStore; 