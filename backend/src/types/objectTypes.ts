import { ZodSchema } from 'zod';

export interface DisplayFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'stats' | 'list' | 'custom';
  priority: number;
  condition?: (data: any) => boolean;
}

export interface EditableFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'list';
  required?: boolean;
  options?: string[];
  validation?: ZodSchema;
}

export interface PermissionConfig {
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  roles?: string[];
}

export interface ContextBuilder {
  (contextId: string, campaignId: string, objectType: string): Promise<Record<string, any>>;
}

export interface ObjectTypeDefinition {
  // Identification
  name: string;
  displayName: string;
  pluralName: string;
  icon?: string;
  
  // Generation Configuration
  promptTemplate: string;
  zodSchema: ZodSchema;
  contextBuilder: ContextBuilder;
  
  // UI Configuration
  displayFields: DisplayFieldConfig[];
  editableFields: EditableFieldConfig[];
  
  // Metadata
  category: 'character' | 'location' | 'item' | 'lore';
  defaultData: Record<string, any>;
  permissions?: PermissionConfig;
}

export interface GeneratedObject {
  id: string;
  objectType: string;
  data: Record<string, any>;
  metadata: {
    provider: string;
    model: string;
    tokensUsed: number;
    costEstimate: number;
    responseTimeMs: number;
    timestamp: Date;
  };
}

// Base interface for generation metadata
export interface GenerationMetadata {
  provider: string;
  model: string;
  tokensUsed: number;
  costEstimate: number;
  responseTimeMs: number;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}

// Context interface extending from existing PromptContext
export interface ObjectContext extends Record<string, any> {
  USER_PROMPT: string;
  OBJECT_TYPE: string;
  CAMPAIGN_NAME?: string;
  CAMPAIGN_DESCRIPTION?: string;
  REGION_NAME?: string;
  REGION_DESCRIPTION?: string;
  CITY_NAME?: string;
  CITY_DESCRIPTION?: string;
  AREA_NAME?: string;
  AREA_DESCRIPTION?: string;
  AREA_TYPE?: string;
}

// Registry error types
export class ObjectTypeError extends Error {
  constructor(message: string, public objectType: string) {
    super(message);
    this.name = 'ObjectTypeError';
  }
}

export class RegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryError';
  }
} 