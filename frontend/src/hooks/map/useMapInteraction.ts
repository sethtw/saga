
import { useCallback, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { api } from '@/api/api';
import { toast } from 'sonner';
import { type Node } from 'reactflow';
import { nanoid } from 'nanoid';
import useHistoryStore from '@/store/historyStore';
import { type Alignment } from '@/components/AlignmentToolbar';
import { useObjectGeneration } from '@/hooks/useObjectGeneration';
import { useObjectTypes } from '@/hooks/useObjectTypes';

export const useMapInteraction = () => {
  const { menu, setMenu, addNode, deleteNode, updateNodeData, onNodesChange } = useMapStore();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Use the new generic object generation system
  const { generateObject, generateCharacter, isGenerating, error: objectGenerationError } = useObjectGeneration();
  const { getObjectTypeDefinition, getObjectTypeDisplayName } = useObjectTypes();

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
        toast.success(`Element "${node.data.name || node.data.label || node.id}" deleted successfully.`);
      } catch (error) {
        console.error('Failed to delete element:', error);
        toast.error('Failed to delete element.');
      }
    } else {
      console.log(`Selected action: ${action} on node:`, node);
    }
    setMenu(null);
  }, [menu, deleteNode, updateNodeData, setMenu]);

  // Enhanced generation submit handler that supports any object type
  const handleGenerateSubmit = useCallback(async (
    prompt: string, 
    provider?: string, 
    objectType: string = 'character'
  ) => {
    if (!menu) return;

    const { campaignId } = (window as any).location.pathname.match(/\/campaigns\/(\d+)/) || [];
    if (!campaignId) {
      toast.error('No campaign ID found');
      return;
    }

    setGenerationError(null);

    try {
      setIsGeneratorOpen(false);

      console.log(`🎯 Generating ${objectType} using generic frontend system`);

      // Use the new generic object generation system
      const result = await generateObject(
        objectType,
        prompt,
        menu.node.id,
        campaignId,
        provider
      );

      if (!result) {
        // Error toast already shown by the hook
        return;
      }

      // Create the new node with generic object data
      const newNode: Node = {
        id: result.id,
        type: objectType === 'character' ? 'character' : 'character', // For now, use character node for all types
        position: { x: menu.node.position.x + 50, y: menu.node.position.y + 100 },
        data: {
          ...result.data,
          // Add object type information for the node
          objectType: result.objectType,
          // Store LLM metadata for analytics and tooltips
          llmMetadata: result.metadata
        },
        parentId: menu.node.id,
        extent: 'parent',
      };

      addNode(newNode);
      
      // Success toast is already shown by the hook with detailed info
      console.log(`✅ Successfully created ${objectType} node:`, newNode);

    } catch (error: any) {
      console.error(`Failed to generate ${objectType}:`, error);
      
      // Handle specific errors that might not be caught by the hook
      let errorMessage = `Failed to generate ${getObjectTypeDisplayName(objectType)}. Please try again.`;
      
      if (error.message) {
        if (error.message.includes('No LLM providers')) {
          errorMessage = 'No LLM providers are available. Please check your configuration.';
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('authentication')) {
          errorMessage = 'LLM authentication failed. Please check your API keys.';
        } else if (error.message.includes('Invalid object type')) {
          errorMessage = `Invalid object type: ${objectType}. Please try a different type.`;
        } else {
          errorMessage = error.message;
        }
      }
      
      setGenerationError(errorMessage);
      toast.error(errorMessage);
    }
  }, [addNode, menu, generateObject, getObjectTypeDisplayName]);

  // Backward compatibility method for character generation
  const handleGenerateCharacterSubmit = useCallback(async (prompt: string, provider?: string) => {
    return handleGenerateSubmit(prompt, provider, 'character');
  }, [handleGenerateSubmit]);

  // Enhanced method for generating any object type
  const handleGenerateObjectSubmit = useCallback(async (
    objectType: string,
    prompt: string, 
    provider?: string
  ) => {
    return handleGenerateSubmit(prompt, provider, objectType);
  }, [handleGenerateSubmit]);

  const handleAddNode = useCallback(async (objectType: string) => {
    const position = {
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
    };
    
    // Use the object type definition to get default data
    const definition = await getObjectTypeDefinition(objectType);
    const displayName = definition?.displayName || objectType.charAt(0).toUpperCase() + objectType.slice(1);

    const data = {
      name: `New ${displayName}`,
      description: `A new ${displayName}.`,
      objectType: objectType,
      ...(definition?.defaultData || {}),
    };

    try {
      const newNode: Node = {
        id: nanoid(),
        type: objectType,
        position,
        data,
      };
      addNode(newNode);
      toast.success(`${displayName} created successfully!`);
    } catch (error) {
      console.error(`Failed to create ${objectType}:`, error);
      toast.error(`Failed to create ${displayName}. Please try again.`);
    }
  }, [addNode, getObjectTypeDefinition]);

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
    
    // Generation methods (enhanced)
    handleGenerateSubmit, // Generic method
    handleGenerateCharacterSubmit, // Backward compatibility
    handleGenerateObjectSubmit, // Explicit object type method
    
    handleAddNode,
    handleAlign,
    isGeneratorOpen,
    setIsGeneratorOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedNode,
    isGenerating,
    generationError: generationError || objectGenerationError,
    setGenerationError,
  };
}; 