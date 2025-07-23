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
import { PlusIcon, HomeIcon, DiscIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
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
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAutoSave } from '../hooks/useAutoSave';

// We need a separate component to render the flow so that we can wrap it in a ReactFlowProvider
const FlowRenderer = ({ campaignId }: { campaignId: string }) => {
    const {
        onEdgeUpdate,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        setMenu,
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
        isDirty,
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
          if (isDirty) {
            event.preventDefault();
            event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            return "You have unsaved changes. Are you sure you want to leave?";
          }
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, [isDirty]);


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
    ]);

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
            const response = await api.createElement({
                campaign_id: parseInt(campaignId!),
                type: 'character',
                data: { prompt },
                position: { x: menu.node.position.x + 50, y: menu.node.position.y + 100 },
            });

            const newCharacter = response;
            const newNode: Node = {
                id: newCharacter.id.toString(),
                type: 'character',
                position: { x: menu.node.position.x + 50, y: menu.node.position.y + 100 },
                data: newCharacter.data as { name: string; description: string },
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
            const newElement = await api.createElement({
                campaign_id: parseInt(campaignId!),
                type,
                data,
                position,
            });
            const newNode: Node = {
                id: newElement.id.toString(),
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
        if (isDirty) {
            setPendingNavigation(() => () => navigate('/'));
            setIsUnsavedChangesModalOpen(true);
        } else {
            navigate('/');
        }
    }, [isDirty, navigate]);

    return (
        <div className="relative h-screen w-screen" onClick={() => setMenu(null)}>
            <Toaster />
            <div className="absolute top-4 left-4 z-10">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Actions</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="flex w-40 flex-col p-2">
                                    <Button onClick={() => handleAddNode('room')} variant="ghost" className="justify-start">
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add Room
                                    </Button>
                                    <Button onClick={() => handleAddNode('item')} variant="ghost" className="justify-start">
                                        <PaperPlaneIcon className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving} variant="ghost" className="justify-start">
                                        <DiscIcon className="mr-2 h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button onClick={handleNavigateHome} variant="ghost" className="justify-start">
                                        <HomeIcon className="mr-2 h-4 w-4" />
                                        Home
                                    </Button>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
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