
import { useCallback, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { api } from '@/api/api';
import { toast } from 'sonner';
import { type Node } from 'reactflow';
import { nanoid } from 'nanoid';
import useHistoryStore from '@/store/historyStore';
import { type Alignment } from '@/components/AlignmentToolbar';

export const useMapInteraction = () => {
  const { menu, setMenu, addNode, deleteNode, updateNodeData, onNodesChange } = useMapStore();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsEditModalOpen(true);
  }, []);

  const handleMenuAction = useCallback(async (action: string) => {
    if (!menu) return;
    const { node } = menu;

    if (action === 'generate-character') {
      setIsGeneratorOpen(true);
    } else if (action === 'edit-element') {
      setSelectedNode(node);
      setIsEditModalOpen(true);
    } else if (action === 'delete-element') {
      try {
        await api.deleteElement(node.id.toString());
        deleteNode(node.id);
        toast.success(`Element "${node.data.name || node.id}" deleted successfully.`);
      } catch (error) {
        console.error('Failed to delete element:', error);
        toast.error('Failed to delete element.');
      }
    } else {
      console.log(`Selected action: ${action} on node:`, node);
    }
    setMenu(null);
  }, [menu, deleteNode, updateNodeData, setMenu]);

  const handleGenerateSubmit = useCallback(async (prompt: string) => {
    if (!menu) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      setIsGeneratorOpen(false);

      const newNode: Node = {
        id: nanoid(),
        type: 'character',
        position: { x: menu.node.position.x + 50, y: menu.node.position.y + 100 },
        data: { prompt },
        parentId: menu.node.id,
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
  }, [addNode, menu]);

  const handleAddNode = useCallback(async (type: 'room' | 'item' = 'room') => {
    const position = {
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
    };
    const data = type === 'room'
      ? { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` }
      : { name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` };

    try {
      const newNode: Node = {
        id: nanoid(),
        type,
        position,
        data,
      };
      addNode(newNode);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
      toast.error(`Failed to create ${type}. Please try again.`);
    }
  }, [addNode]);

  const handleAlign = (alignment: Alignment) => {
    const { getNodes } = (window as any).reactFlowStore.getState();
    const selectedNodes = getNodes().filter((n: Node) => n.selected);

    if (selectedNodes.length < 2) return;

    useHistoryStore.getState().addPresentToPast(`Aligned nodes: ${alignment}`);

    onNodesChange(selectedNodes.map((n: Node) => ({
      id: n.id,
      type: 'position',
      position: n.position,
    })));

    toast.success('Nodes aligned');
  };

  return {
    onNodeDoubleClick,
    handleMenuAction,
    handleGenerateSubmit,
    handleAddNode,
    handleAlign,
    isGeneratorOpen,
    setIsGeneratorOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedNode,
    isGenerating,
    generationError,
    setGenerationError,
  };
}; 