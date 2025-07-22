import React from 'react';

/**
 * @file ContextMenu.tsx
 * @description A context menu that appears on right-clicking a map element.
 */

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onSelect: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onSelect }) => {
  return (
    <div
      style={{ top: y, left: x }}
      className="absolute z-50 bg-gray-800 border border-purple-500 rounded-md shadow-lg"
      onClick={onClose}
    >
      <ul className="py-1">
        <li
          onClick={() => onSelect('generate-character')}
          className="px-4 py-2 hover:bg-purple-700 cursor-pointer text-white"
        >
          Generate Character
        </li>
        <li
          onClick={() => onSelect('edit-description')}
          className="px-4 py-2 hover:bg-purple-700 cursor-pointer text-white"
        >
          Edit Description
        </li>
        <li
          onClick={() => onSelect('add-item')}
          className="px-4 py-2 hover:bg-purple-700 cursor-pointer text-white"
        >
          Add Item
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu; 