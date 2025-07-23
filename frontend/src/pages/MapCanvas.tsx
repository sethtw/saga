import React, { useState, useCallback, useEffect } from 'react';
import useMapStore from '../store/mapStore';
import CustomContextMenu from '../components/ContextMenu';
import { type Node, useReactFlow, type Viewport } from 'reactflow';
import GeneratorModal from '../components/GeneratorModal';
import EditElementModal from '../components/EditElementModal';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import Flow from '../components/Flow';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { PlusIcon, HomeIcon, DiscIcon } from '@radix-ui/react-icons';

const MapCanvas: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { nodes, edges, addNode, setNodes, setEdges, updateNodeData } = useMapStore();
  const [selectedNodeForMenu, setSelectedNodeForMenu] = useState<Node | null>(null);
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
    setSelectedNodeForMenu(node);
  }, []);

  const handleMenuAction = (action: string) => {
    const node = selectedNodeForMenu;
    if (!node) return;

    if (action === 'generate-character') {
      setIsGeneratorOpen(true);
    } else if (action === 'edit-element') {
      setSelectedNode(node);
      setIsEditModalOpen(true);
    } else {
      console.log(`Selected action: ${action} on node:`, node);
    }
    setSelectedNodeForMenu(null);
  };

  const handleSave = async () => {
    if (!campaignId) return;
    setIsSaving(true);
    const promise = () => new Promise<void>(async (resolve, reject) => {
      try {
        // Save the nodes and edges
        await api.post(`/campaigns/${campaignId}/elements`, { nodes, edges });

        // Save the viewport
        const viewport = getViewport();
        await api.put(`/campaigns/${campaignId}/viewport`, viewport);
        resolve();
      } catch (error) {
        console.error('Failed to save map state:', error);
        reject(error);
      } finally {
        setIsSaving(false);
      }
    });

    toast.promise(promise, {
      loading: 'Saving map state...',
      success: 'Map state saved successfully!',
      error: 'Failed to save map state.',
    });
  };

  const handleGenerateSubmit = async (prompt: string) => {
    if (!selectedNodeForMenu) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      setIsGeneratorOpen(false);
      const response = await api.post('/generate/character', {
        prompt,
        contextId: selectedNodeForMenu.id,
      });

      const newCharacter = response.data;
      const newNode: Node = {
        id: newCharacter.element_id.toString(),
        type: 'character',
        position: { x: selectedNodeForMenu.position.x + 50, y: selectedNodeForMenu.position.y + 100 },
        data: { name: newCharacter.data.name, description: newCharacter.data.description },
        parentNode: selectedNodeForMenu.id,
        extent: 'parent',
      };
      addNode(newNode);
      toast.success('Character generated successfully!');

    } catch (error) {
      console.error('Failed to generate character:', error);
      setGenerationError('Failed to generate character. Please try again.');
      toast.error('Failed to generate character. Please try again.');
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
    <div className="relative h-screen w-screen" onClick={() => setSelectedNodeForMenu(null)}>
      <Toaster />
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button onClick={handleAddNode} size="icon">
          <PlusIcon className="h-4 w-4" />
        </Button>
        <Button onClick={handleSave} disabled={isSaving} size="icon">
          <DiscIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => navigate('/')} size="icon" variant="outline">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </div>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <p>Loading Map...</p>
        </div>
      ) : (
        <CustomContextMenu onSelect={handleMenuAction}>
          <Flow
            onNodeContextMenu={onNodeContextMenu}
            getViewport={getViewport}
            setViewport={setViewport}
            savedViewport={savedViewport}
          />
        </CustomContextMenu>
      )}
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
        <div className="absolute bottom-4 right-4 z-10 rounded-md bg-background/80 p-4">
          <p>Generating...</p>
        </div>
      )}
      {generationError && (
        // This is now handled by the toaster, but leaving the state for now
        // in case we want to display it in a different way.
        null
      )}
    </div>
  );
};

export default MapCanvas; 