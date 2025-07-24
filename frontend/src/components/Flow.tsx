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
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useMapStore from '../store/mapStore';
import useHistoryStore from '../store/historyStore';
import RoomNode from './RoomNode';
import CharacterNode from './CharacterNode';
import ItemNode from './ItemNode';
import CustomEdge from './CustomEdge';
import { useTheme } from '../hooks/useTheme';

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
      setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 50);
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

  const handleSelectionContextMenu = (_event: React.MouseEvent, nodes: Node[]) => {
    console.log('Selection Context Menu:', nodes);
  };

  const handleSelectionDrag = (_event: React.MouseEvent, nodes: Node[]) => {
    console.log('Selection Dragged:', nodes);
  };

  const handleSelectionStart = (_event: React.MouseEvent) => {
    console.log('Selection Started');
  };

  const handleSelectionEnd = (_event: React.MouseEvent) => {
    console.log('Selection Ended');
  };

  const handleNodesChange = (changes: NodeChange[]) => {

    console.log('handleNodesChange changes:', changes);

    // // Check for resize changes
    // const resizeChange = changes.find(c => c.type === 'dimensions');

    // if (resizeChange?.type === 'dimensions') {
    //   if (resizeChange.resizing) {
    //     // resize start
    //     if (!resizeStartInfo) {
    //       const node = nodes.find(n => n.id === resizeChange.id);
    //       if (node?.width && node?.height) {
    //         setResizeStartInfo({
    //           id: node.id,
    //           startDate: new Date(),
    //           width: node.width,
    //           height: node.height,
    //           position: { x: node.position.x, y: node.position.y },
    //         });
    //         console.log('Node Resize Start');
    //       }
    //     }
    //   } else if (resizeStartInfo && resizeStartInfo.id === resizeChange.id) {
    //     // resize end
    //     const endDate = new Date();
    //     const duration = endDate.getTime() - resizeStartInfo.startDate.getTime();
    //     console.log('Node Resize Duration:', duration);
    //     if (duration > 2000) {
    //       addPresentToPast('Node Resized');
    //       console.log('Node Resized');
    //     } else {
    //       console.log('Node Resize Stop (no change)');
    //     }
    //     setResizeStartInfo(null);
    //   }
    // }

    // // Check for node position changes
    // const positionChange = changes.find(c => c.type === 'position');
    // if (positionChange?.type === 'position') {
    //   if (moveStartInfo && moveStartInfo.id === positionChange.id) {
    //     const endDate = new Date();
    //     const duration = endDate.getTime() - moveStartInfo.startDate.getTime();
    //     console.log('Node Move Duration:', duration);
    //     if (duration > 2000) {
    //       addPresentToPast('Node Moved');
    //       console.log('Node Moved');
    //     } else {
    //       console.log('Node Move Stop (no change)');
    //     }
    //     setMoveStartInfo(null);
    //   }
    // }

    // // Check for node selection changes
    // const selectionChange = changes.find(c => c.type === 'select');
    // if (selectionChange?.type === 'select') {
    //   if (selectionChange.selected) {
    //     setSelectionStartInfo({ id: selectionChange.id, startDate: new Date() });
    //   } else {
    //     if (selectionStartInfo && selectionStartInfo.id === selectionChange.id) {
    //       const endDate = new Date();
    //       const duration = endDate.getTime() - selectionStartInfo.startDate.getTime();
    //       console.log('Node Selection Duration:', duration);
    //       if (duration > 2000) {
    //         addPresentToPast('Node Selected');
    //         console.log('Node Selected');
    //       } else {
    //         console.log('Node Selection Stop (no change)');
    //       }
    //       setSelectionStartInfo(null);
    //     }
    //   }
    // }

    onNodesChange(changes);
  };

  // Node Clicking
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    console.log('Node Clicked:', node.id);
  };

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
    console.log('Node Double Clicked:', node.id);
  };

  // Edge Clicking
  const handleEdgeClick = (_event: React.MouseEvent, edge: Edge) => {
    console.log('Edge Clicked:', edge.id);
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
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onSelectionContextMenu={handleSelectionContextMenu}      
      onSelectionDrag={handleSelectionDrag}
      onSelectionStart={handleSelectionStart}
      onSelectionEnd={handleSelectionEnd}
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