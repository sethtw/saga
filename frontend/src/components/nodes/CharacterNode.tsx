import React, { memo, useState } from 'react';
import { Handle, Position, NodeResizer, NodeProps } from 'reactflow';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/base-node';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

/**
 * @file CharacterNode.tsx
 * @description A component representing a "Character" on the map.
 */

interface CharacterStats {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  level?: number;
  hp?: number;
  ac?: number;
}

interface LLMMetadata {
  provider: string;
  model: string;
  tokensUsed: number;
  costEstimate: number;
  responseTimeMs: number;
}

interface CharacterNodeData {
  name: string;
  description: string;
  stats?: CharacterStats;
  race?: string;
  class?: string;
  background?: string;
  alignment?: string;
  personality?: string;
  equipment?: string[];
  llmMetadata?: LLMMetadata;
}

const CharacterNode: React.FC<NodeProps<CharacterNodeData>> = ({ data, selected }) => {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <TooltipProvider>
      <BaseNode className={isResizing ? 'nodrag' : ''}>
        <NodeResizer
          color="#ff0071"
          isVisible={selected}
          minWidth={200}
          minHeight={120}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
        />
        <Handle type="target" position={Position.Left} />
        
        <BaseNodeHeader>
          <div className="flex items-center justify-between w-full">
            <BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
            {data.llmMetadata && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    {data.llmMetadata.provider}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p><strong>Provider:</strong> {data.llmMetadata.provider}</p>
                    <p><strong>Model:</strong> {data.llmMetadata.model}</p>
                    <p><strong>Tokens:</strong> {data.llmMetadata.tokensUsed}</p>
                    <p><strong>Cost:</strong> ${data.llmMetadata.costEstimate.toFixed(4)}</p>
                    <p><strong>Time:</strong> {data.llmMetadata.responseTimeMs}ms</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </BaseNodeHeader>
        
        <BaseNodeContent>
          {/* Character basic info */}
          <div className="space-y-2">
            {data.race && data.class && (
              <div className="flex gap-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{data.race}</Badge>
                <Badge variant="outline" className="text-xs">{data.class}</Badge>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-3">
              {data.description}
            </p>
            
            {/* Stats preview */}
            {data.stats && (
              <div className="grid grid-cols-3 gap-1 text-xs">
                {Object.entries(data.stats).slice(0, 6).map(([stat, value]) => (
                  <span key={stat} className="text-muted-foreground">
                    <strong>{stat.toUpperCase()}:</strong> {value}
                  </span>
                ))}
              </div>
            )}
            
            {/* Personality preview */}
            {data.personality && (
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                "{data.personality}"
              </p>
            )}
          </div>
        </BaseNodeContent>
        
        <Handle type="source" position={Position.Right} />
      </BaseNode>
    </TooltipProvider>
  );
};

export default memo(CharacterNode); 