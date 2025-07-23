import React, { memo, useState } from 'react';
import { Handle, Position, NodeResizer, NodeProps } from 'reactflow';
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

const RoomNode: React.FC<NodeProps<RoomNodeData>> = ({ data, selected }) => {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <BaseNode className={isResizing ? 'nodrag' : ''}>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={50}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => setIsResizing(false)}
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