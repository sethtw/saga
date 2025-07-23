import React, { useState, useCallback, useEffect } from 'react';
import useMapStore from '../store/mapStore';
import CustomContextMenu from '../components/ContextMenu';
import { type Node, useReactFlow, type Viewport, ReactFlowProvider, useStoreApi } from 'reactflow';
import GeneratorModal from '../components/GeneratorModal';
import EditElementModal from '../components/EditElementModal';
import { api } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import Flow from '../components/Flow';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { HomeIcon, DiscIcon } from '@radix-ui/react-icons';
import { useHotkeys } from '../hooks/use-hotkeys';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useAutoSave } from '../hooks/useAutoSave';
import { nanoid } from 'nanoid';
import FloatingToolbar from '@/components/FloatingToolbar';
import useHistoryStore from '@/store/historyStore';
import AlignmentToolbar, { type Alignment } from '@/components/AlignmentToolbar';

// We need a separate component to render the flow so that we can wrap it in a ReactFlowProvider
const FlowRenderer = ({ campaignId }: { campaignId: string }) => {
    const {
        onEdgeUpdate,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        setMenu,
        setViewportDirty,
    } = useMapStore();
    const [savedViewport, _setSavedViewport] = useState<Viewport | null>(null);
    const { getViewport, setViewport } = useReactFlow();

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
        event.preventDefault();
        const pane = (event.target as HTMLElement).closest('.react-flow__pane');
        if (!pane) return;
        const paneRect = pane.getBoundingClientRect();
        setMenu({
            x: event.clientX - paneRect.left,
            y: event.clientY - paneRect.top,
            node,
        });
    }, [setMenu]);

    // Expose the save function to the window for manual save
    useEffect(() => {
        (window as any).saveMapWithViewport = async () => {
            try {
                const { getNodes } = (window as any).reactFlowStore.getState();
                const { edges } = useMapStore.getState();
                
                // Save the nodes and edges
                const nodesToSave = getNodes().map(({ id, type, position, data, parentId, width, height }: Node) => ({
                    id,
                    type,
                    position,
                    data,
                    parentId,
                    width,
                    height,
                }));

                await api.saveElements(parseInt(campaignId), nodesToSave, edges);

                // Save the viewport using the proper getViewport function
                const viewport = getViewport();
                await api.updateCampaign(parseInt(campaignId), { 
                    viewport_x: viewport.x, 
                    viewport_y: viewport.y, 
                    viewport_zoom: viewport.zoom 
                });
                
                return true;
            } catch (error) {
                console.error('Failed to save map state:', error);
                throw error;
            }
        };

        // Expose a function to save just the viewport
        (window as any).saveViewport = async () => {
            try {
                const viewport = getViewport();
                await api.updateCampaign(parseInt(campaignId), { 
                    viewport_x: viewport.x, 
                    viewport_y: viewport.y, 
                    viewport_zoom: viewport.zoom 
                });
                return true;
            } catch (error) {
                console.error('Failed to save viewport:', error);
                throw error;
            }
        };
    }, [campaignId, getViewport]);

    return (
        <div className="h-full w-full" onClick={() => setMenu(null)}>
            <Flow
                onNodeContextMenu={onNodeContextMenu}
                getViewport={getViewport}
                setViewport={setViewport}
                savedViewport={savedViewport}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeUpdateStart={onEdgeUpdateStart}
                onEdgeUpdateEnd={onEdgeUpdateEnd}
                onViewportChange={() => setViewportDirty(true)}
            />
        </div>
    );
}


const MapCanvas: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const navigate = useNavigate();
    const {
        menu,
        setMenu,
        setNodes,
        setEdges,
        addNode,
        deleteNode,
        updateNodeData,
        loadOriginalState,
        getChangedElements,
        clearChanges,
        areElementsDirty,
        isViewportDirty,
    } = useMapStore();
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
    const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
    const [showAlignmentToolbar, setShowAlignmentToolbar] = useState(false);

    // By exposing the store through the window, we can access it from anywhere in the app.
    // This is a temporary solution to get the save functionality working again.
    const store = useStoreApi();

    useEffect(() => {
        (window as any).reactFlowStore = store;
    }, [store]);

    // Enhanced auto-save with efficient synchronization
    useAutoSave({
        onSave: async (nodes, edges) => {
            if (campaignId) {
                try {
                    const changes = getChangedElements();
                    
                    // Only sync if there are actual changes
                    if (changes.addedNodes.length > 0 || 
                        changes.updatedNodes.length > 0 || 
                        changes.deletedNodeIds.length > 0 ||
                        changes.addedEdges.length > 0 || 
                        changes.updatedEdges.length > 0 || 
                        changes.deletedEdgeIds.length > 0) {
                        
                        await api.syncChanges(parseInt(campaignId), changes);
                        clearChanges();
                        toast.success('Map saved!');
                    }
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                    toast.error('Failed to save map.');
                }
            }
        },
    });

    // Load map data and viewport on initial render
    useEffect(() => {
        const loadData = async () => {
            if (!campaignId) return;
            setIsLoading(true);
            try {
                const { nodes, edges } = await api.getCampaignElements(parseInt(campaignId));
                setNodes(nodes);
                setEdges(edges);
                // Load the original state for change tracking
                loadOriginalState(nodes, edges);
            } catch (error) {
                console.error('Failed to load map data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [campaignId, setNodes, setEdges, loadOriginalState]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
          if (areElementsDirty) {
            event.preventDefault();
            event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            return "You have unsaved changes. Are you sure you want to leave?";
          }
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, [areElementsDirty]);

    useEffect(() => {
        const { getNodes } = (window as any).reactFlowStore.getState();
        const selectedNodes = getNodes().filter((n: Node) => n.selected);
        setShowAlignmentToolbar(selectedNodes.length > 1);
    }, [useMapStore().nodes]);


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

    const { undo, redo } = useHistoryStore();
    const { interactionMode, setInteractionMode } = useMapStore();

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
                        selected: true, // Select the new nodes
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

    const handleAlign = (alignment: Alignment) => {
        const { getNodes } = (window as any).reactFlowStore.getState();
        const selectedNodes = getNodes().filter((n: Node) => n.selected);

        if (selectedNodes.length < 2) return;

        useHistoryStore.getState().addPresentToPast();

        const { onNodesChange } = useMapStore.getState();

        let newPositions = new Map<string, { x: number, y: number }>();

        switch (alignment) {
            case 'align-left': {
                const minX = Math.min(...selectedNodes.map((n: Node) => n.position.x));
                selectedNodes.forEach((n: Node) => newPositions.set(n.id, { ...n.position, x: minX }));
                break;
            }
            case 'align-horizontal-center': {
                const centerX = selectedNodes.reduce((sum: number, n: Node) => sum + n.position.x + (n.width ?? 0) / 2, 0) / selectedNodes.length;
                selectedNodes.forEach((n: Node) => newPositions.set(n.id, { ...n.position, x: centerX - (n.width ?? 0) / 2 }));
                break;
            }
            case 'align-right': {
                const maxX = Math.max(...selectedNodes.map((n: Node) => n.position.x + (n.width ?? 0)));
                selectedNodes.forEach((n: Node) => newPositions.set(n.id, { ...n.position, x: maxX - (n.width ?? 0) }));
                break;
            }
            case 'align-top': {
                const minY = Math.min(...selectedNodes.map((n: Node) => n.position.y));
                selectedNodes.forEach((n: Node) => newPositions.set(n.id, { ...n.position, y: minY }));
                break;
            }
            case 'align-vertical-center': {
                const centerY = selectedNodes.reduce((sum: number, n: Node) => sum + n.position.y + (n.height ?? 0) / 2, 0) / selectedNodes.length;
                selectedNodes.forEach((n: Node) => newPositions.set(n.id, { ...n.position, y: centerY - (n.height ?? 0) / 2 }));
                break;
            }
            case 'align-bottom': {
                const maxY = Math.max(...selectedNodes.map((n: Node) => n.position.y + (n.height ?? 0)));
                selectedNodes.forEach((n: Node) => newPositions.set(n.id, { ...n.position, y: maxY - (n.height ?? 0) }));
                break;
            }
        }

        onNodesChange(selectedNodes.map((n: Node) => ({
            id: n.id,
            type: 'position',
            position: newPositions.get(n.id)!,
        })));

        toast.success('Nodes aligned');
    };

    const handleSave = useCallback(async () => {
        if (!campaignId) return;
        setIsSaving(true);
        const promise = () => new Promise<void>(async (resolve, reject) => {
            try {
                // Use the new efficient sync system
                const changes = getChangedElements();
                
                if (changes.addedNodes.length > 0 || 
                    changes.updatedNodes.length > 0 || 
                    changes.deletedNodeIds.length > 0 ||
                    changes.addedEdges.length > 0 || 
                    changes.updatedEdges.length > 0 || 
                    changes.deletedEdgeIds.length > 0) {
                    
                    await api.syncChanges(parseInt(campaignId), changes);
                    clearChanges();
                }

                // Save the viewport using the window-exposed save function
                await (window as any).saveViewport();
                
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
    }, [campaignId, getChangedElements, clearChanges]);

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
    }, [addNode, menu, campaignId]);

    const handleAddNode = useCallback(async (type: 'room' | 'item' = 'room') => {
        const position = {
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
        };
        // Use different field names based on node type
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
    }, [addNode, campaignId]);

    const handleNavigateHome = useCallback(() => {
        if (areElementsDirty) {
            setPendingNavigation(() => () => navigate('/'));
            setIsUnsavedChangesModalOpen(true);
        } else {
            navigate('/');
        }
    }, [areElementsDirty, navigate]);

    return (
        <div className="relative h-screen w-screen" onClick={() => setMenu(null)}>
            <Toaster />
            <FloatingToolbar onAddRoom={() => handleAddNode('room')} onAddItem={() => handleAddNode('item')} />
            {showAlignmentToolbar && <AlignmentToolbar onAlign={handleAlign} />}
            <div className="absolute top-4 left-4 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleSave} disabled={isSaving}>
                            <DiscIcon className="mr-2 h-4 w-4" />
                            Save
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleNavigateHome}>
                            <HomeIcon className="mr-2 h-4 w-4" />
                            Home
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {isLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                    <p>Loading Map...</p>
                </div>
            ) : (
                <ReactFlowProvider>
                    <FlowRenderer campaignId={campaignId!} />
                </ReactFlowProvider>
            )}
            <CustomContextMenu
                open={!!menu}
                onClose={() => setMenu(null)}
                onSelect={handleMenuAction}
            >
                <div
                    className="absolute"
                    style={{
                        top: menu?.y ?? 0,
                        left: menu?.x ?? 0,
                        width: 1,
                        height: 1,
                    }}
                />
            </CustomContextMenu>
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
            <AlertDialog open={isUnsavedChangesModalOpen} onOpenChange={setIsUnsavedChangesModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to save your changes before leaving? Your unsaved work will be lost otherwise.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            if (pendingNavigation) {
                                pendingNavigation();
                            }
                        }}>Leave without Saving</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={async () => {
                                await handleSave();
                                if (pendingNavigation) {
                                    pendingNavigation();
                                }
                            }}
                        >
                            Save and Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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