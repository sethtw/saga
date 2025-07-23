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
      className="context-menu"
      onClick={onClose}
    >
      <ul className="context-menu-list">
        <li
          onClick={() => onSelect('edit-element')}
          className="context-menu-item"
        >
          Edit Element
        </li>
        <li
          onClick={() => onSelect('generate-character')}
          className="context-menu-item"
        >
          Generate Character
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu; 