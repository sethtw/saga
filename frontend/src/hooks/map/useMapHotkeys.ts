
import { useHotkeys } from '../use-hotkeys';
import useMapStore from '@/store/mapStore';
import { api } from '@/api/api';
import { toast } from 'sonner';
import { type Node } from 'reactflow';
import { nanoid } from 'nanoid';
import useHistoryStore from '@/store/historyStore';

export const useMapHotkeys = (copiedNodes: Node[], setCopiedNodes: (nodes: Node[]) => void) => {
  const { deleteNode, addNode, setInteractionMode, interactionMode } = useMapStore();
  const { undo, redo } = useHistoryStore.getState();

  useHotkeys([
    ['Backspace', async () => {
      const { getNodes } = (window as any).reactFlowStore.getState();
      const selectedNodes = getNodes().filter((n: Node) => n.selected);
      if (selectedNodes.length === 0) return;

      const promise = () => new Promise<void>(async (resolve, reject) => {
        try {
          for (const node of selectedNodes) {
            await api.deleteElement(node.id.toString());
            deleteNode(node.id);
          }
          resolve();
        } catch (error) {
          console.error('Failed to delete elements:', error);
          reject(error);
        }
      });

      toast.promise(promise, {
        loading: 'Deleting elements...',
        success: `${selectedNodes.length} element(s) deleted successfully.`,
        error: 'Failed to delete elements.',
      });
    }, { preventDefault: true }],
    ['ctrl+c', () => {
      const { getNodes } = (window as any).reactFlowStore.getState();
      const selectedNodes = getNodes().filter((n: Node) => n.selected);
      if (selectedNodes.length > 0) {
        setCopiedNodes(selectedNodes);
        toast.info(`Copied ${selectedNodes.length} node(s)`);
      }
    }],
    ['ctrl+v', () => {
      if (copiedNodes.length > 0) {
        const newNodes = copiedNodes.map((node) => {
          const newNode = {
            ...node,
            id: nanoid(),
            position: {
              x: node.position.x + 20,
              y: node.position.y + 20,
            },
            selected: true,
          };
          addNode(newNode);
          return newNode;
        });
        toast.success(`Pasted ${newNodes.length} node(s)`);
      }
    }],
    ['v', () => {
      setInteractionMode(interactionMode === 'drag' ? 'pan' : 'drag');
    }],
    ['ctrl+z', () => {
      undo();
      toast.info('Undo');
    }, { preventDefault: true }],
    ['ctrl+y', () => {
      redo();
      toast.info('Redo');
    }, { preventDefault: true }],
  ]);
}; 