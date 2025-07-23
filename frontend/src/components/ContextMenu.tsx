import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface CustomContextMenuProps {
  children: React.ReactNode;
  onSelect: (action: string) => void;
}

const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ children, onSelect }) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onSelect('edit-element')}>
          Edit Element
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onSelect('generate-character')}>
          Generate Character
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CustomContextMenu; 