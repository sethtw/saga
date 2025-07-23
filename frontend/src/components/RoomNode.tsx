import React, { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
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

const RoomNode: React.FC<{ data: RoomNodeData, selected: boolean }> = ({ data, selected }) => {
  return (
    <BaseNode>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={50}
      />
      <Handle type="target" position={Position.Top} />
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>{data.label}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
};

export default memo(RoomNode); 