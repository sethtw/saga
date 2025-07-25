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
import useHistoryStore from '@/store/historyStore';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useObjectTypes } from '@/hooks/useObjectTypes';

interface FloatingToolbarProps {
  onAddNode: (objectType: string) => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onAddNode }) => {
  const { interactionMode, setInteractionMode } = useMapStore();
  const { undo, redo, past, future } = useHistoryStore();
  const { objectTypes, getObjectTypeIcon } = useObjectTypes();

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {objectTypes.map((objectType) => (
              <DropdownMenuItem
                key={objectType.name}
                onClick={() => onAddNode(objectType.name)}
              >
                <span className="mr-2 h-4 w-4">{getObjectTypeIcon(objectType.name)}</span>
                Add {objectType.displayName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={undo} variant="ghost" size="icon" disabled={past.length === 0}>
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={redo} variant="ghost" size="icon" disabled={future.length === 0}>
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={past.length === 0}>
              <ClockIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <ScrollArea className="h-48 w-48">
              <div className="p-4">
                <h4 className="mb-4 text-sm font-medium leading-none">History</h4>
                {past.length > 0 ? (
                  past.map((entry, index) => (
                    <div key={index} className="text-sm">
                      {entry.description}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No history yet.</div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
};

export default FloatingToolbar; 