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
import { useObjectTypes } from '@/hooks/useObjectTypes';

/**
 * @file CharacterNode.tsx
 * @description A component representing any object type on the map (Character, NPC, Item, etc.)
 * Enhanced to support generic object data structure while maintaining character compatibility.
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

// Generic object data structure
interface GenericObjectData {
  // Core fields that all objects should have
  name: string;
  description: string;

  // Generic fields that can be present on any object type
  [key: string]: any;

  // LLM generation metadata
  llmMetadata?: LLMMetadata;
}

// Extended node props to include object type information
interface ObjectNodeProps extends NodeProps<GenericObjectData> {
  data: GenericObjectData & {
    objectType: string; // Object type identifier is now mandatory
  };
}

const GenericObjectNode: React.FC<ObjectNodeProps> = ({ data, selected }) => {
  const [isResizing, setIsResizing] = useState(false);
  const { getObjectTypeDefinition, getObjectTypeDisplayName, getObjectTypeIcon } = useObjectTypes();

  // Determine object type
  const { objectType } = data;
  const objectTypeDefinition = getObjectTypeDefinition(objectType);

  // Render field based on its configuration
  const renderField = (key: string, value: any, fieldConfig?: any) => {
    if (!value) return null;

    switch (fieldConfig?.type) {
      case 'badge':
        return Array.isArray(value) ? (
          <div className="flex gap-1 flex-wrap">
            {value.map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">{item}</Badge>
            ))}
          </div>
        ) : (
          <Badge variant="outline" className="text-xs">{value}</Badge>
        );

      case 'stats':
        if (typeof value === 'object') {
          return (
            <div className="grid grid-cols-3 gap-1 text-xs">
              {Object.entries(value).slice(0, 6).map(([stat, statValue]) => (
                <span key={stat} className="text-muted-foreground">
                  <strong>{stat.toUpperCase()}:</strong> {statValue}
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">{value}</span>;

      case 'list':
        if (Array.isArray(value)) {
          return (
            <div className="text-xs text-muted-foreground">
              <strong>{fieldConfig?.label}:</strong> {value.join(', ')}
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">{value}</span>;

      case 'text':
      default:
        if (key === 'personality' || key === 'description') {
          return (
            <p className={`text-xs text-muted-foreground ${key === 'personality' ? 'italic' : ''} line-clamp-2`}>
              {key === 'personality' ? `"${value}"` : value}
            </p>
          );
        }
        return <span className="text-xs text-muted-foreground">{value}</span>;
    }
  };

  // Get display fields from object type definition
  const getDisplayFields = () => {
    if (objectTypeDefinition?.displayFields) {
      return objectTypeDefinition.displayFields
        .sort((a, b) => a.priority - b.priority)
        .filter(field => {
          const value = data[field.key];
          if (!value) return false;
          if (field.condition) {
            try {
              return field.condition(data);
            } catch {
              return true; // Default to showing if condition fails
            }
          }
          return true;
        });
    }
    // No fallback - should always rely on the definition
    return [];
  };

  const displayFields = getDisplayFields();

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
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">
                {getObjectTypeIcon(objectType)}
              </span>
              <BaseNodeHeaderTitle>{data.name || 'Untitled'}</BaseNodeHeaderTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {getObjectTypeDisplayName(objectType)}
              </Badge>
              {data.llmMetadata && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs">
                      {data.llmMetadata.provider}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p><strong>Object Type:</strong> {getObjectTypeDisplayName(objectType)}</p>
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
          </div>
        </BaseNodeHeader>
        
        <BaseNodeContent>
          <div className="space-y-2">
            {/* Main description */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {data.description}
            </p>
            
            {/* Render fields based on object type definition */}
            {displayFields.map((field) => {
              const value = data[field.key];
              // Don't render name/description again as they are in standard locations
              if (!value || field.key === 'name' || field.key === 'description') return null;
              
              return (
                <div key={field.key}>
                  {renderField(field.key, value, field)}
                </div>
              );
            })}
          </div>
        </BaseNodeContent>
        
        <Handle type="source" position={Position.Right} />
      </BaseNode>
    </TooltipProvider>
  );
};

export default memo(GenericObjectNode); 