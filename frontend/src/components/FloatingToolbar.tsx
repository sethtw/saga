import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, PaperPlaneIcon, HandIcon, CursorArrowIcon } from '@radix-ui/react-icons';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import useMapStore from '@/store/mapStore';

interface FloatingToolbarProps {
    onAddRoom: () => void;
    onAddItem: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onAddRoom, onAddItem }) => {
    const { interactionMode, setInteractionMode } = useMapStore();

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background rounded-md shadow-md p-2 flex gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => setInteractionMode(interactionMode === 'drag' ? 'pan' : 'drag')}
                            variant="ghost"
                            size="icon"
                        >
                            {interactionMode === 'drag' ? <HandIcon className="h-5 w-5" /> : <CursorArrowIcon className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Switch to {interactionMode === 'drag' ? 'Pan' : 'Drag'} Mode (V)</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={onAddRoom} variant="ghost" size="icon">
                            <PlusIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Room</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={onAddItem} variant="ghost" size="icon">
                            <PaperPlaneIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Item</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default FloatingToolbar; 