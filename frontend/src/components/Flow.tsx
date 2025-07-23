import React from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useReactFlow,
    BackgroundVariant,
    type Node,
    type Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useMapStore from '../store/mapStore';
import RoomNode from './RoomNode';
import CharacterNode from './CharacterNode';

const nodeTypes = {
    room: RoomNode,
    character: CharacterNode,
};

interface FlowProps {
    onNodeContextMenu: (event: React.MouseEvent, node: Node) => void;
    getViewport: () => Viewport;
    setViewport: (viewport: Viewport) => void;
    savedViewport: Viewport | null;
}

const Flow: React.FC<FlowProps> = ({ onNodeContextMenu, getViewport: _getViewport, setViewport, savedViewport }) => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useMapStore();
    const { fitView } = useReactFlow();

    React.useEffect(() => {
        if (savedViewport) {
            setViewport(savedViewport);
        } else if (nodes.length > 0) {
            setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 50);
        }
    }, [nodes, fitView, savedViewport, setViewport]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeContextMenu={onNodeContextMenu}
        >
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Background variant={BackgroundVariant.Dots} color="#4f4f4f" gap={15} />
        </ReactFlow>
    );
};

export default Flow; 