import React, { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from './base-node';

/**
 * @file CharacterNode.tsx
 * @description A component representing a "Character" on the map.
 */

interface CharacterNodeData {
  name: string;
  description: string;
}

const CharacterNode: React.FC<{ data: CharacterNodeData, selected: boolean }> = ({ data, selected }) => {
  return (
    <BaseNode>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={180}
        minHeight={100}
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