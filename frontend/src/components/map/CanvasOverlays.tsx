
import React from 'react';

interface CanvasOverlaysProps {
  isLoading: boolean;
  isGenerating: boolean;
  generationError: string | null;
}

const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({ isLoading, isGenerating, generationError }) => {
  return (
    <>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <p>Loading Map...</p>
        </div>
      ) : null}
      {isGenerating && (
        <div className="absolute bottom-4 right-4 z-10 rounded-md bg-background/80 p-4">
          <p>Generating...</p>
        </div>
      )}
      {generationError && (
        null
      )}
    </>
  );
};

export default CanvasOverlays; 