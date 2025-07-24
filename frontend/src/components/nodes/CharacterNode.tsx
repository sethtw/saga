import React, { memo, useState } from 'react';
import { Handle, Position, NodeResizer, NodeProps } from 'reactflow';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/base-node';

/**
 * @file CharacterNode.tsx
 * @description A component representing a "Character" on the map.
 */

interface CharacterNodeData {
  name: string;
  description: string;
}

const CharacterNode: React.FC<NodeProps<CharacterNodeData>> = ({ data, selected }) => {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <BaseNode className={isResizing ? 'nodrag' : ''}>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={180}
        minHeight={100}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => setIsResizing(false)}
      />
      <Handle type="target" position={Position.Left} />
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </BaseNodeContent>
      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
};

export default memo(CharacterNode); 