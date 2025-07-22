import React from 'react';
import { Handle, Position } from 'reactflow';
import withMapElement from './MapElement';

/**
 * @file CharacterNode.tsx
 * @description A component representing a "Character" on the map.
 */

interface CharacterNodeData {
  name: string;
  description: string;
}

const CharacterNode: React.FC<{ data: CharacterNodeData }> = ({ data }) => {
  return (
    <div className="p-3 max-w-xs">
      <Handle type="target" position={Position.Left} className="!bg-cyan-500" />
      <div className="font-bold text-md text-cyan-300">{data.name}</div>
      <p className="text-sm text-gray-300 mt-1">{data.description}</p>
      <Handle type="source" position={Position.Right} className="!bg-cyan-500" />
    </div>
  );
};

export default withMapElement(CharacterNode); 