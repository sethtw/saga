import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomContextMenuProps {
  children: React.ReactNode;
  onSelect: (action: string) => void;
  open: boolean;
  onClose: () => void;
}

const CustomContextMenu: React.FC<CustomContextMenuProps> = ({
  children,
  onSelect,
  open,
  onClose,
}) => {
  return (
    <DropdownMenu open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuItem onClick={() => onSelect('edit-element')}>
          Edit Element
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('generate-character')}>
          Generate Character
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('delete-element')}>
          Delete Element
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomContextMenu; 