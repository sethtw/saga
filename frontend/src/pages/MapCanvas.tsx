import React, { useState, useCallback, useEffect } from 'react';
import useMapStore from '../store/mapStore';
import CustomContextMenu from '../components/ContextMenu';
import { type Node, ReactFlowProvider, useStoreApi } from 'reactflow';
import { useParams, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import FloatingToolbar from '@/components/FloatingToolbar';
import AlignmentToolbar from '@/components/AlignmentToolbar';
import { FlowRenderer } from '@/components/FlowRenderer';
import { useCampaignLoader } from '@/hooks/map/useCampaignLoader';
import { useUnsavedChangesProtection } from '@/hooks/map/useUnsavedChangesProtection';
import { useMapHotkeys } from '@/hooks/map/useMapHotkeys';
import { useSaveMap } from '@/hooks/map/useSaveMap';
import { useMapInteraction } from '@/hooks/map/useMapInteraction';
import TopLeftToolbar from '@/components/map/TopLeftToolbar';
import MapModals from '@/components/map/MapModals';
import CanvasOverlays from '@/components/map/CanvasOverlays';

const MapCanvas: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { menu, setMenu, areElementsDirty, isViewportDirty, updateNodeData } = useMapStore();
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [showAlignmentToolbar, setShowAlignmentToolbar] = useState(false);

  const isLoading = useCampaignLoader(campaignId);
  useUnsavedChangesProtection();
  useMapHotkeys(copiedNodes, setCopiedNodes);
  const { isSaving, handleSave } = useSaveMap(campaignId);
  const {
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
  } = useMapInteraction(campaignId);

  const store = useStoreApi();
  useEffect(() => {
    (window as any).reactFlowStore = store;
  }, [store]);

  useEffect(() => {
    const { getNodes } = (window as any).reactFlowStore.getState();
    const selectedNodes = getNodes().filter((n: Node) => n.selected);
    setShowAlignmentToolbar(selectedNodes.length > 1);
  }, [useMapStore().nodes]);

  const handleNavigateHome = useCallback(() => {
    if (areElementsDirty || isViewportDirty) {
      setPendingNavigation(() => () => navigate('/'));
      setIsUnsavedChangesModalOpen(true);
    } else {
      navigate('/');
    }
  }, [areElementsDirty, isViewportDirty, navigate]);

  return (
    <div className="relative h-screen w-screen" onClick={() => setMenu(null)}>
      <Toaster />
      <FloatingToolbar onAddArea={() => handleAddNode('area')} onAddItem={() => handleAddNode('item')} />
      {showAlignmentToolbar && <AlignmentToolbar onAlign={handleAlign} />}
      <TopLeftToolbar
        handleSave={handleSave}
        isSaving={isSaving}
        handleNavigateHome={handleNavigateHome}
      />
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <p>Loading Map...</p>
        </div>
      ) : (
        <ReactFlowProvider>
          <FlowRenderer campaignId={campaignId!} onNodeDoubleClick={onNodeDoubleClick} />
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
      <MapModals
        isGeneratorOpen={isGeneratorOpen}
        setIsGeneratorOpen={setIsGeneratorOpen}
        setGenerationError={setGenerationError}
        handleGenerateSubmit={handleGenerateSubmit}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        updateNodeData={updateNodeData}
        selectedNode={selectedNode}
        isUnsavedChangesModalOpen={isUnsavedChangesModalOpen}
        setIsUnsavedChangesModalOpen={setIsUnsavedChangesModalOpen}
        pendingNavigation={pendingNavigation}
        handleSave={handleSave}
      />
      <CanvasOverlays
        isLoading={isLoading}
        isGenerating={isGenerating}
        generationError={generationError}
      />
    </div>
  );
};

export default MapCanvas; 