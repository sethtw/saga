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
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAutoSave } from '../hooks/useAutoSave';

// We need a separate component to render the flow so that we can wrap it in a ReactFlowProvider
const FlowRenderer = () => {
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
    } = useMapStore();
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // By exposing the store through the window, we can access it from anywhere in the app.
    // This is a temporary solution to get the save functionality working again.
    const store = useStoreApi();

    useEffect(() => {
        (window as any).reactFlowStore = store;
    }, [store]);

    useAutoSave({
        onSave: async (nodes, edges) => {
            if (campaignId) {
                await api.saveElements(parseInt(campaignId), nodes, edges);
                toast.success('Map saved!');
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
            } catch (error) {
                console.error('Failed to load map data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [campaignId, setNodes, setEdges]);


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
                const { getNodes, getViewport } = (window as any).reactFlowStore.getState();
                const { edges } = useMapStore.getState();
                // Save the nodes and edges
                const nodesToSave = getNodes().map(({ id, type, position, data, parentNode, width, height }: Node) => ({
                    id,
                    type,
                    position,
                    data,
                    parentNode,
                    width,
                    height,
                }));

                await api.saveElements(parseInt(campaignId), nodesToSave, edges)

                // Save the viewport
                const viewport = getViewport();
                await api.updateCampaign(parseInt(campaignId), { viewport_x: viewport.x, viewport_y: viewport.y, viewport_zoom: viewport.zoom });
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
    }, [campaignId]);

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
                parentNode: menu.node.id,
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
        const data = { name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` };

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
        navigate('/');
    }, [navigate]);

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
                    <FlowRenderer />
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