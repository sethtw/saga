import React from 'react';
import { Handle, Position } from 'reactflow';
import withMapElement from './MapElement';

/**
 * @file RoomNode.tsx
 * @description A component representing a "Room" on the map. Rooms are containers
 * for other elements and can be connected to other nodes.
 */

interface RoomNodeData {
  label: string;
}

const RoomNode: React.FC<{ data: RoomNodeData }> = ({ data }) => {
  return (
    <div className="p-4">
      <Handle type="target" position={Position.Top} className="!bg-teal-500" />
      <div className="font-bold text-lg">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500" />
    </div>
  );
};

export default withMapElement(RoomNode); 