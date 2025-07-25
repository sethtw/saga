// Mirror the backend interfaces for frontend use
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
}

export interface PermissionConfig {
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  roles?: string[];
}

export interface ObjectTypeDefinition {
  name: string;
  displayName: string;
  pluralName: string;
  icon?: string;
  category: 'character' | 'location' | 'item' | 'lore';
  displayFields: DisplayFieldConfig[];
  editableFields: EditableFieldConfig[];
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

// Frontend object type registry (simplified version)
export class ObjectTypeRegistry {
  private static instance: ObjectTypeRegistry;
  private definitions = new Map<string, ObjectTypeDefinition>();

  private constructor() {}

  public static getInstance(): ObjectTypeRegistry {
    if (!ObjectTypeRegistry.instance) {
      ObjectTypeRegistry.instance = new ObjectTypeRegistry();
    }
    return ObjectTypeRegistry.instance;
  }

  public register(definition: ObjectTypeDefinition): void {
    this.definitions.set(definition.name, definition);
  }

  public get(objectType: string): ObjectTypeDefinition | undefined {
    return this.definitions.get(objectType);
  }

  public getAll(): ObjectTypeDefinition[] {
    return Array.from(this.definitions.values());
  }

  public isValidType(objectType: string): boolean {
    return this.definitions.has(objectType);
  }
}

export const objectRegistry = ObjectTypeRegistry.getInstance(); 