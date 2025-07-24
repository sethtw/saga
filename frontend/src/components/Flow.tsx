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
import useMapStore from '@/store/mapStore';
import useHistoryStore from '@/store/historyStore';
import RoomNode from '@/components/RoomNode';
import CharacterNode from '@/components/CharacterNode';
import ItemNode from '@/components/ItemNode';
import CustomEdge from '@/components/CustomEdge';
import { useTheme } from '@/hooks/useTheme';

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
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
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
  onNodeDoubleClick,
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
  const [dragStartNodeInfo, setDragStartNodeInfo] = React.useState<{ position: { x: number, y: number }, startDate: Date } | null>(null);
  const [dragStartSelectionInfo, setDragStartSelectionInfo] = React.useState<Map<string, { x: number, y: number }> | null>(null);
  const theme = useTheme();

  React.useEffect(() => {
    if (savedViewport) {
      setViewport(savedViewport);
    } else if (nodes.length > 0) {
      setTimeout(() => fitView({ duration: 400, padding: 0.7 }), 50);
    }
  }, [nodes.length, fitView, savedViewport, setViewport]);

  // Node Dragging
  const handleNodeDragStart = (_event: React.MouseEvent, node: Node) => {
    setDragStartNodeInfo({ position: { ...node.position }, startDate: new Date() });
    console.log('Node Drag Start');
  };

  const handleNodeDragStop = (_event: React.MouseEvent, node: Node) => {
    console.log('Node Drag Stop - Start');
    if (dragStartNodeInfo && (dragStartNodeInfo.position.x !== node.position.x || dragStartNodeInfo.position.y !== node.position.y)) {
      const endDate = new Date();
      const duration = endDate.getTime() - dragStartNodeInfo.startDate.getTime();
      if (duration > 400) {
        addPresentToPast('Node Drag Stop');
        console.log('Node Drag Stop - Added to Past');
      }
    }
    setDragStartNodeInfo(null);
  };

  // Selection
  const handleSelectionDragStart = (_event: React.MouseEvent, draggedNodes: Node[]) => {
    const positions = new Map(draggedNodes.map(n => [n.id, { ...n.position }]));
    setDragStartSelectionInfo(positions);
    console.log('Selection Drag Start');
  };

  const handleSelectionDragStop = (_event: React.MouseEvent, draggedNodes: Node[]) => {
    if (dragStartSelectionInfo) {
      const changed = draggedNodes.some(n => {
        const startPos = dragStartSelectionInfo.get(n.id);
        return startPos && (startPos.x !== n.position.x || startPos.y !== n.position.y);
      });
      if (changed) {
        addPresentToPast('Selection Dragged');
        console.log('Selection Dragged');
      } else {
        console.log('Selection Drag Stop (no change)');
      }
    }
    setDragStartSelectionInfo(null);
  };

  const handleNodesChange = (changes: NodeChange[]) => {
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
      onNodeDoubleClick={onNodeDoubleClick}
      onMove={onViewportChange}
      panOnDrag={interactionMode === 'pan'}
      selectionOnDrag={interactionMode === 'drag'}
      nodesDraggable={interactionMode === 'drag'}
      onNodeDragStart={handleNodeDragStart}
      onNodeDragStop={handleNodeDragStop}
      onSelectionDragStart={handleSelectionDragStart}
      onSelectionDragStop={handleSelectionDragStop}
      className={`${theme === 'dark' ? 'dark' : ''} ${interactionMode === 'pan' ? 'grabbing' : ''}`}
    >
      <Controls>
        <button onClick={() => fitView({ duration: 800 })} className="react-flow__controls-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-expand"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" /><path d="M3 15.2V21h5.8" /><path d="M3 3h6l-6 6" /><path d="M21 3h-6l6 6" /></svg>
        </button>
      </Controls>
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
      <Background variant={BackgroundVariant.Dots} gap={15} />
    </ReactFlow>
  );
};

export default Flow; 