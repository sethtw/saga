import React from 'react';
import { Handle, Position } from 'reactflow';
import withMapElement from './MapElement';
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

const CharacterNode: React.FC<{ data: CharacterNodeData }> = ({ data }) => {
  return (
    <BaseNode>
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

export default withMapElement(CharacterNode); 