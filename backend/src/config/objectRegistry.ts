import { ObjectTypeDefinition, RegistryError, ObjectTypeError } from '../types/objectTypes';

export class ObjectTypeRegistry {
  private static instance: ObjectTypeRegistry;
  private definitions = new Map<string, ObjectTypeDefinition>();
  private initialized = false;

  private constructor() {}

  public static getInstance(): ObjectTypeRegistry {
    if (!ObjectTypeRegistry.instance) {
      ObjectTypeRegistry.instance = new ObjectTypeRegistry();
    }
    return ObjectTypeRegistry.instance;
  }

  public register(definition: ObjectTypeDefinition): void {
    try {
      this.validateDefinition(definition);
      
      if (this.definitions.has(definition.name)) {
        console.warn(`Overwriting existing object type definition: ${definition.name}`);
      }
      
      this.definitions.set(definition.name, definition);
      console.log(`✅ Registered object type: ${definition.name} (${definition.displayName})`);
    } catch (error) {
      throw new RegistryError(`Failed to register object type '${definition.name}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public get(objectType: string): ObjectTypeDefinition {
    const definition = this.definitions.get(objectType);
    if (!definition) {
      throw new ObjectTypeError(`Object type '${objectType}' not found in registry`, objectType);
    }
    return definition;
  }

  public getAll(): ObjectTypeDefinition[] {
    return Array.from(this.definitions.values());
  }

  public getByCategory(category: string): ObjectTypeDefinition[] {
    return this.getAll().filter(def => def.category === category);
  }

  public isValidType(objectType: string): boolean {
    return this.definitions.has(objectType);
  }

  public getTypeNames(): string[] {
    return Array.from(this.definitions.keys());
  }

  public getStats(): { totalTypes: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    
    this.getAll().forEach(def => {
      byCategory[def.category] = (byCategory[def.category] || 0) + 1;
    });

    return {
      totalTypes: this.definitions.size,
      byCategory
    };
  }

  public clear(): void {
    this.definitions.clear();
    this.initialized = false;
    console.log('🗑️  Object type registry cleared');
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public markInitialized(): void {
    this.initialized = true;
    console.log(`🚀 Object type registry initialized with ${this.definitions.size} types`);
  }

  private validateDefinition(definition: ObjectTypeDefinition): void {
    // Basic required fields
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('Object type definition must have a valid name');
    }

    if (!definition.displayName || typeof definition.displayName !== 'string') {
      throw new Error('Object type definition must have a valid displayName');
    }

    if (!definition.pluralName || typeof definition.pluralName !== 'string') {
      throw new Error('Object type definition must have a valid pluralName');
    }

    // Generation configuration
    if (!definition.promptTemplate || typeof definition.promptTemplate !== 'string') {
      throw new Error('Object type definition must have a valid promptTemplate');
    }

    if (!definition.zodSchema) {
      throw new Error('Object type definition must have a zodSchema');
    }

    if (!definition.contextBuilder || typeof definition.contextBuilder !== 'function') {
      throw new Error('Object type definition must have a valid contextBuilder function');
    }

    // UI configuration
    if (!Array.isArray(definition.displayFields)) {
      throw new Error('Object type definition must have displayFields array');
    }

    if (!Array.isArray(definition.editableFields)) {
      throw new Error('Object type definition must have editableFields array');
    }

    // Category validation
    const validCategories = ['character', 'location', 'item', 'lore'];
    if (!validCategories.includes(definition.category)) {
      throw new Error(`Invalid category '${definition.category}'. Must be one of: ${validCategories.join(', ')}`);
    }

    // Default data
    if (!definition.defaultData || typeof definition.defaultData !== 'object') {
      throw new Error('Object type definition must have defaultData object');
    }

    // Validate display fields
    definition.displayFields.forEach((field, index) => {
      if (!field.key || !field.label || !field.type) {
        throw new Error(`Display field at index ${index} must have key, label, and type`);
      }

      const validTypes = ['text', 'badge', 'stats', 'list', 'custom'];
      if (!validTypes.includes(field.type)) {
        throw new Error(`Invalid display field type '${field.type}' at index ${index}`);
      }

      if (typeof field.priority !== 'number') {
        throw new Error(`Display field priority must be a number at index ${index}`);
      }
    });

    // Validate editable fields
    definition.editableFields.forEach((field, index) => {
      if (!field.key || !field.label || !field.type) {
        throw new Error(`Editable field at index ${index} must have key, label, and type`);
      }

      const validTypes = ['text', 'textarea', 'number', 'select', 'list'];
      if (!validTypes.includes(field.type)) {
        throw new Error(`Invalid editable field type '${field.type}' at index ${index}`);
      }

      if (field.type === 'select' && !Array.isArray(field.options)) {
        throw new Error(`Select field at index ${index} must have options array`);
      }
    });
  }
}

// Export singleton instance
export const objectRegistry = ObjectTypeRegistry.getInstance();

// Helper function to auto-register object types from a directory
export async function autoRegisterObjectTypes(directory: string = 'objectTypes'): Promise<void> {
  try {
    console.log(`🔍 Auto-registering object types from: ${directory}`);
    
    // Register object type definitions
    const { characterDefinition } = await import('./objectTypes/character');
    const { npcDefinition } = await import('./objectTypes/npc');
    const { monsterDefinition } = await import('./objectTypes/monster');
    const { areaDefinition } = await import('./objectTypes/area');
    const { itemDefinition } = await import('./objectTypes/item');
    
    objectRegistry.register(characterDefinition);
    objectRegistry.register(npcDefinition);
    objectRegistry.register(monsterDefinition);
    objectRegistry.register(areaDefinition);
    objectRegistry.register(itemDefinition);
    
    objectRegistry.markInitialized();
    
    const stats = objectRegistry.getStats();
    console.log(`✅ Object registry initialized successfully!`);
    console.log(`   - Total types: ${stats.totalTypes}`);
    console.log(`   - By category:`, stats.byCategory);
  } catch (error) {
    console.error('Failed to auto-register object types:', error);
    throw new RegistryError(`Auto-registration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} 