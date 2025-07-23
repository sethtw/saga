import React, { memo, useState } from 'react';
import { Handle, Position, type NodeProps, NodeResizer } from 'reactflow';
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from './base-node';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

const ItemNode: React.FC<NodeProps> = ({ data, selected }) => {
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
        <PaperPlaneIcon className="h-5 w-5" />
        <BaseNodeHeaderTitle>{data.name || 'Item'}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
};

export default memo(ItemNode); 