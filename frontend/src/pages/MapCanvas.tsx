import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useMapStore from '../store/mapStore';
import RoomNode from '../components/RoomNode';
import ContextMenu from '../components/ContextMenu';
import { type Node } from 'reactflow';
import GeneratorModal from '../components/GeneratorModal';
import CharacterNode from '../components/CharacterNode';
import api from '../api/api';


const MapCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useMapStore();
  const nodeTypes = useMemo(() => ({ room: RoomNode, character: CharacterNode }), []);
  const [menu, setMenu] = useState<{ x: number, y: number, node: Node } | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, node });
  }, [setMenu]);

  const handleMenuAction = (action: string) => {
    setMenu(null);
    if (action === 'generate-character') {
      setIsGeneratorOpen(true);
    } else {
      console.log(`Selected action: ${action} on node:`, menu?.node);
    }
  };

  const handleGenerateSubmit = async (prompt: string) => {
    if (!menu) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      setIsGeneratorOpen(false);
      const response = await api.post('/generate/character', {
        prompt,
        contextId: menu.node.id,
      });
      
      const newCharacter = response.data;
      const newNode: Node = {
        id: newCharacter.element_id.toString(),
        type: 'character',
        position: { x: menu.node.position.x + 50, y: menu.node.position.y + 100 },
        data: { name: newCharacter.data.name, description: newCharacter.data.description },
        parentNode: menu.node.id,
        extent: 'parent',
      };
      addNode(newNode);

    } catch (error) {
      console.error('Failed to generate character:', error);
      setGenerationError('Failed to generate character. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node_${Math.random()}`,
      type: 'room',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: 'New Room' },
    };
    addNode(newNode);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#1a1a1a' }} onClick={() => setMenu(null)}>
      <button 
        onClick={handleAddNode} 
        className="absolute top-4 left-4 z-10 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Node
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onNodeContextMenu={onNodeContextMenu}
      >
        <Controls />
        <Background color="#4f4f4f" gap={15} />
      </ReactFlow>
      {menu && <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} onSelect={handleMenuAction} />}
      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setGenerationError(null);
        }}
        onSubmit={handleGenerateSubmit}
        title="Generate a New Character"
      />
      {isGenerating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white">
          Generating...
        </div>
      )}
      {generationError && (
        <div className="absolute bottom-4 right-4 bg-red-800 p-4 rounded-lg text-white">
          {generationError}
        </div>
      )}
    </div>
  );
};

export default MapCanvas; 