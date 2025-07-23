import React, { useState, useCallback, useEffect } from 'react';
import useMapStore from '../store/mapStore';
import ContextMenu from '../components/ContextMenu';
import { type Node, useReactFlow, type Viewport } from 'reactflow';
import GeneratorModal from '../components/GeneratorModal';
import EditElementModal from '../components/EditElementModal';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import Flow from '../components/Flow';

const MapCanvas: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { nodes, edges, addNode, setNodes, setEdges, updateNodeData } = useMapStore();
  const [menu, setMenu] = useState<{ x: number, y: number, node: Node } | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedViewport, setSavedViewport] = useState<Viewport | null>(null);
  const { getViewport, setViewport } = useReactFlow();

  // Load map data and viewport on initial render
  useEffect(() => {
    const loadData = async () => {
      if (!campaignId) return;
      setIsLoading(true);
      try {
        // Fetch campaign data to get the viewport
        const campaignRes = await api.get(`/campaigns/${campaignId}`);
        const { viewport_x, viewport_y, viewport_zoom } = campaignRes.data;
        if (viewport_x && viewport_y && viewport_zoom) {
          setSavedViewport({ x: viewport_x, y: viewport_y, zoom: viewport_zoom });
        }

        // Fetch map elements
        const elementsRes = await api.get(`/campaigns/${campaignId}/elements`);
        const { nodes: loadedNodesData, links: loadedLinksData } = elementsRes.data;

        const loadedNodes = loadedNodesData.map((el: any) => ({
          id: el.element_id.toString(),
          type: el.type,
          position: { x: el.position_x, y: el.position_y },
          data: el.data,
          parentNode: el.parent_element_id?.toString(),
        }));
        
        const loadedEdges = loadedLinksData.map((link: any) => ({
          id: link.link_id,
          source: link.source_element_id,
          target: link.target_element_id,
        }));

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [campaignId, setNodes, setEdges, setViewport]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, node });
  }, [setMenu]);

  const handleMenuAction = (action: string) => {
    const node = menu?.node;
    setMenu(null);
    if (action === 'generate-character') {
      setIsGeneratorOpen(true);
    } else if (action === 'edit-element' && node) {
      setSelectedNode(node);
      setIsEditModalOpen(true);
    } else {
      console.log(`Selected action: ${action} on node:`, node);
    }
  };

  const handleSave = async () => {
    if (!campaignId) return;
    setIsSaving(true);
    try {
      // Save the nodes and edges
      await api.post(`/campaigns/${campaignId}/elements`, { nodes, edges });

      // Save the viewport
      const viewport = getViewport();
      await api.put(`/campaigns/${campaignId}/viewport`, viewport);

      console.log('Map state and viewport saved successfully.');
    } catch (error) {
      console.error('Failed to save map state:', error);
    } finally {
      setIsSaving(false);
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
    <div className="fullscreen-canvas" onClick={() => setMenu(null)}>
      <div className="toolbar">
        <button
          onClick={handleAddNode}
          className="btn-primary"
        >
          Add Node
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-success"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Exit
        </button>
      </div>
      {isLoading ? (
        <div className="loading-overlay">
          Loading Map...
        </div>
      ) : (
        <Flow
          onNodeContextMenu={onNodeContextMenu}
          getViewport={getViewport}
          setViewport={setViewport}
          savedViewport={savedViewport}
        />
      )}
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
      <EditElementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateNodeData}
        node={selectedNode}
      />
      {isGenerating && (
        <div className="status-overlay">
          Generating...
        </div>
      )}
      {generationError && (
        <div className="error-notification">
          {generationError}
        </div>
      )}
    </div>
  );
};

export default MapCanvas; 