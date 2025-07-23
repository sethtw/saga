import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    AlignHorizontalJustifyStartIcon, 
    AlignHorizontalJustifyCenterIcon, 
    AlignHorizontalJustifyEndIcon,
    AlignVerticalJustifyStartIcon,
    AlignVerticalJustifyCenterIcon,
    AlignVerticalJustifyEndIcon,
} from 'lucide-react';

type Alignment = 
    | 'align-left' 
    | 'align-horizontal-center' 
    | 'align-right' 
    | 'align-top' 
    | 'align-vertical-center' 
    | 'align-bottom';

interface AlignmentToolbarProps {
    onAlign: (alignment: Alignment) => void;
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({ onAlign }) => {
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-background rounded-md shadow-md p-2 flex gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onAlign('align-left')} variant="ghost" size="icon">
                            <AlignHorizontalJustifyStartIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Align Left</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onAlign('align-horizontal-center')} variant="ghost" size="icon">
                            <AlignHorizontalJustifyCenterIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Center Horizontally</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onAlign('align-right')} variant="ghost" size="icon">
                            <AlignHorizontalJustifyEndIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Align Right</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onAlign('align-top')} variant="ghost" size="icon">
                            <AlignVerticalJustifyStartIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Align Top</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onAlign('align-vertical-center')} variant="ghost" size="icon">
                            <AlignVerticalJustifyCenterIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Center Vertically</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onAlign('align-bottom')} variant="ghost" size="icon">
                            <AlignVerticalJustifyEndIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Align Bottom</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default AlignmentToolbar;
export type { Alignment }; 