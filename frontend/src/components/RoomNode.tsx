import React from 'react';
import { Handle, Position } from 'reactflow';
import withMapElement from './MapElement';
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from './base-node';

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
    <BaseNode>
      <Handle type="target" position={Position.Top} />
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>{data.label}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
};

export default withMapElement(RoomNode); 