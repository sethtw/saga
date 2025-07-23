import React from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useReactFlow,
    BackgroundVariant,
    type Node,
    type Viewport,
    type OnEdgeUpdateFunc,
    type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useMapStore from '../store/mapStore';
import useHistoryStore from '../store/historyStore';
import RoomNode from './RoomNode';
import CharacterNode from './CharacterNode';
import ItemNode from './ItemNode';
import CustomEdge from './CustomEdge';

const nodeTypes = {
    room: RoomNode,
    character: CharacterNode,
    item: ItemNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

interface FlowProps {
    onNodeContextMenu: (event: React.MouseEvent, node: Node) => void;
    getViewport: () => Viewport;
    setViewport: (viewport: Viewport) => void;
    savedViewport: Viewport | null;
    onEdgeUpdate: OnEdgeUpdateFunc;
    onEdgeUpdateStart: () => void;
    onEdgeUpdateEnd: () => void;
    onViewportChange: () => void;
}

const Flow: React.FC<FlowProps> = ({
    onNodeContextMenu,
    getViewport: _getViewport,
    setViewport,
    savedViewport,
    onEdgeUpdate,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    onViewportChange,
}) => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, interactionMode } = useMapStore();
    const { addPresentToPast } = useHistoryStore();
    const { fitView } = useReactFlow();

    React.useEffect(() => {
        if (savedViewport) {
            setViewport(savedViewport);
        } else if (nodes.length > 0) {
            setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 50);
        }
    }, [nodes.length, fitView, savedViewport, setViewport]);

    const handleNodeDragStart = () => {
        addPresentToPast('Node Drag Start');
    };

    const handleNodeDragStop = () => {
        addPresentToPast('Node Drag Stop');
    };

    const handleSelectionDragStart = () => {
        addPresentToPast('Selection Drag Start');
    };

    const handleSelectionDragStop = () => {
        addPresentToPast('Selection Drag Stop');
    };

    const handleNodesChange = (changes: NodeChange[]) => {
        // This is a workaround to capture the end of a resize event.
        const isResizeEnd = changes.some(change => change.type === 'dimensions' && !change.resizing);
        if (isResizeEnd) {
            addPresentToPast('Node Resize');
        }
        onNodesChange(changes);
    };

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeContextMenu={onNodeContextMenu}
            onMove={onViewportChange}
            className={interactionMode === 'pan' ? 'grabbing' : ''}
            panOnDrag={interactionMode === 'pan'}
            selectionOnDrag={interactionMode === 'drag'}
            nodesDraggable={interactionMode === 'drag'}
            onNodeDragStart={handleNodeDragStart}
            onNodeDragStop={handleNodeDragStop}
            onSelectionDragStart={handleSelectionDragStart}
            onSelectionDragStop={handleSelectionDragStop}
        >
            <Controls>
                <button onClick={() => fitView({ duration: 800 })} className="react-flow__controls-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-expand"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 15.2V21h5.8"/><path d="M3 3h6l-6 6"/><path d="M21 3h-6l6 6"/></svg>
                </button>
            </Controls>
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Background variant={BackgroundVariant.Dots} color="#4f4f4f" gap={15} />
        </ReactFlow>
    );
};

export default Flow; 