import React from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useReactFlow,
    BackgroundVariant,
    type Node,
    type Viewport,
    type Edge,
    type Connection,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type OnEdgeUpdateFunc,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useMapStore from '../store/mapStore';
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
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useMapStore();
    const { fitView } = useReactFlow();

    React.useEffect(() => {
        if (savedViewport) {
            setViewport(savedViewport);
        } else if (nodes.length > 0) {
            setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 50);
        }
    }, [nodes.length, fitView, savedViewport, setViewport]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeContextMenu={onNodeContextMenu}
            onMove={onViewportChange}
        >
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Background variant={BackgroundVariant.Dots} color="#4f4f4f" gap={15} />
        </ReactFlow>
    );
};

export default Flow; 