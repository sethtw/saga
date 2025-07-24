
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

  const handleGenerateSubmit = useCallback(async (prompt: string, provider?: string) => {
    if (!menu) return;

    const { campaignId } = (window as any).location.pathname.match(/\/campaigns\/(\d+)/) || [];
    if (!campaignId) {
      toast.error('No campaign ID found');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      setIsGeneratorOpen(false);

      // Call the real LLM API
      const response = await api.generateCharacter(
        prompt,
        menu.node.id,
        campaignId,
        provider
      );

      // Create the new character node with LLM-generated data
      const newNode: Node = {
        id: response.id,
        type: 'character',
        position: { x: menu.node.position.x + 50, y: menu.node.position.y + 100 },
        data: {
          ...response.data,
          // Store LLM metadata for analytics
          llmMetadata: response.llmMetadata
        },
        parentId: menu.node.id,
        extent: 'parent',
      };

      addNode(newNode);
      
      // Show success message with provider info
      const providerName = response.llmMetadata?.provider || 'LLM';
      const cost = response.llmMetadata?.costEstimate?.toFixed(4) || '0';
      const tokens = response.llmMetadata?.tokensUsed || 0;
      
      toast.success(
        `Character "${response.data.name}" generated successfully! ` +
        `(${providerName} • ${tokens} tokens • $${cost})`
      );

    } catch (error: any) {
      console.error('Failed to generate character:', error);
      
      // Handle specific LLM errors
      let errorMessage = 'Failed to generate character. Please try again.';
      
      if (error.message) {
        if (error.message.includes('No LLM providers')) {
          errorMessage = 'No LLM providers are available. Please check your configuration.';
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('authentication')) {
          errorMessage = 'LLM authentication failed. Please check your API keys.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setGenerationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [addNode, menu]);

  const handleAddNode = useCallback(async (type: 'area' | 'item' = 'area') => {
    const position = {
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
    };
    const data = type === 'area'
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