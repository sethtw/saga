
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UndoIcon, RedoIcon, HistoryIcon } from 'lucide-react';
import { HomeIcon, DiscIcon } from '@radix-ui/react-icons';
import useHistoryStore from '@/store/historyStore';

interface TopLeftToolbarProps {
  handleSave: () => void;
  isSaving: boolean;
  handleNavigateHome: () => void;
}

const TopLeftToolbar: React.FC<TopLeftToolbarProps> = ({ handleSave, isSaving, handleNavigateHome }) => {
  const { past, future, undo, redo } = useHistoryStore();

  return (
    <div className="absolute top-4 left-4 z-10 flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleSave} disabled={isSaving}>
            <DiscIcon className="mr-2 h-4 w-4" />
            Save
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleNavigateHome}>
            <HomeIcon className="mr-2 h-4 w-4" />
            Home
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" onClick={undo} disabled={past.length === 0}>
        <UndoIcon className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={redo} disabled={future.length === 0}>
        <RedoIcon className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" disabled={past.length === 0 && future.length === 0}>
            <HistoryIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">History</h4>
              <p className="text-sm text-muted-foreground">
                Review past actions and states.
              </p>
            </div>
            <ScrollArea className="h-72">
              <div className="grid gap-2">
                {future.slice().reverse().map((_, index) => (
                  <div key={`future-${index}`} className="text-sm font-semibold text-primary">
                    Future State {future.length - index}
                  </div>
                ))}
                <div className="text-sm font-semibold text-destructive">Current State</div>
                {past.slice().reverse().map((_, index) => (
                  <div key={`past-${index}`} className="text-sm">
                    Past State {past.length - index}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TopLeftToolbar; 