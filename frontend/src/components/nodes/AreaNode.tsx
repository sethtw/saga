import React, { memo, useState } from 'react';
import { Handle, Position, NodeResizer, NodeProps } from 'reactflow';
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter
} from '@/components/base-node';

/**
 * @file AreaNode.tsx
 * @description A component representing an "Area" on the map. Areas are containers
 * for other elements and can be connected to other nodes.
 */

interface AreaNodeData {
  label: string;
}

const AreaNode: React.FC<NodeProps<AreaNodeData>> = ({ data, selected }) => {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <BaseNode>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={50}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => setIsResizing(false)}
      />
      <Handle type="target" position={Position.Left} />
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>{data.label}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <p>Content</p>
          <p>Content</p>
        </div>
      </BaseNodeContent>
      <BaseNodeFooter>
        <div className="flex flex-col gap-2">
          <p>Footer</p>
        </div>
      </BaseNodeFooter>
      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
};

export default memo(AreaNode); 