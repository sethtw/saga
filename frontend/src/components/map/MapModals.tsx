
import React from 'react';
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
import GeneratorModal from '../GeneratorModal';
import EditElementModal from '../EditElementModal';
import { type Node } from 'reactflow';

interface MapModalsProps {
  isGeneratorOpen: boolean;
  setIsGeneratorOpen: (isOpen: boolean) => void;
  setGenerationError: (error: string | null) => void;
  handleGenerateSubmit: (prompt: string, provider?: string, objectType?: string) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  updateNodeData: (id: string, data: any) => void;
  selectedNode: Node | null;
  isUnsavedChangesModalOpen: boolean;
  setIsUnsavedChangesModalOpen: (isOpen: boolean) => void;
  pendingNavigation: (() => void) | null;
  handleSave: () => Promise<void>;
}

const MapModals: React.FC<MapModalsProps> = ({
  isGeneratorOpen,
  setIsGeneratorOpen,
  setGenerationError,
  handleGenerateSubmit,
  isEditModalOpen,
  setIsEditModalOpen,
  updateNodeData,
  selectedNode,
  isUnsavedChangesModalOpen,
  setIsUnsavedChangesModalOpen,
  pendingNavigation,
  handleSave,
}) => {
  return (
    <>
      {/* Generator Modal */}
      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setGenerationError(null);
        }}
        onSubmit={handleGenerateSubmit}
        title="Generate New Content"
        defaultObjectType="character"
        showObjectTypeSelector={true}
      />

      {/* Edit Element Modal */}
      <EditElementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateNodeData}
        node={selectedNode}
      />
      
      {/* Unsaved Changes Modal */}
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
    </>
  );
};

export default MapModals; 