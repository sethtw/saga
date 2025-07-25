# Generic Object System - Quick Start Guide

## 🚀 Ready to Begin Implementation

This guide provides the immediate next steps to start implementing the Generic Object Generation System. Use this alongside the comprehensive implementation plan for detailed architecture.

## 📋 Phase 1 - Day 1 Tasks (Ready to Execute)

### Immediate Setup (30 minutes)

1. **Create Branch and Backup**
   ```bash
   git checkout -b feature/generic-object-system
   git push -u origin feature/generic-object-system
   ```

2. **Create Directory Structure**
   ```bash
   # Backend
   mkdir -p backend/src/types
   mkdir -p backend/src/config/objectTypes
   mkdir -p backend/src/services/generation
   mkdir -p backend/src/services/contexts
   mkdir -p backend/src/schemas/base
   mkdir -p backend/src/schemas/objects
   
   # Frontend
   mkdir -p frontend/src/types
   mkdir -p frontend/src/hooks
   mkdir -p frontend/src/components/generation
   mkdir -p frontend/src/components/registry
   mkdir -p frontend/src/config/objectTypes
   ```

### Task 1: Core Type Definitions (60 minutes)

**File**: `backend/src/types/objectTypes.ts`
```typescript
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
```

### Task 2: Object Registry Implementation (90 minutes)

**File**: `backend/src/config/objectRegistry.ts`
```typescript
import { ObjectTypeDefinition } from '../types/objectTypes';

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
    this.validateDefinition(definition);
    this.definitions.set(definition.name, definition);
    console.log(`Registered object type: ${definition.name}`);
  }

  public get(objectType: string): ObjectTypeDefinition {
    const definition = this.definitions.get(objectType);
    if (!definition) {
      throw new Error(`Object type '${objectType}' not found in registry`);
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

  private validateDefinition(definition: ObjectTypeDefinition): void {
    if (!definition.name || !definition.displayName) {
      throw new Error('Object type definition must have name and displayName');
    }
    
    if (!definition.promptTemplate || !definition.zodSchema) {
      throw new Error('Object type definition must have promptTemplate and zodSchema');
    }
    
    if (!definition.contextBuilder || typeof definition.contextBuilder !== 'function') {
      throw new Error('Object type definition must have a valid contextBuilder function');
    }
  }
}

// Export singleton instance
export const objectRegistry = ObjectTypeRegistry.getInstance();
```

### Task 3: Database Schema Update (30 minutes)

**File**: `backend/prisma/migrations/add_object_type/migration.sql`
```sql
-- Add object_type column to Element table
ALTER TABLE "Element" ADD COLUMN "object_type" TEXT NOT NULL DEFAULT 'character';

-- Create index for object_type queries
CREATE INDEX "Element_object_type_idx" ON "Element"("object_type");

-- Update existing character records
UPDATE "Element" SET "object_type" = 'character' WHERE "type" = 'character';
```

**Update**: `backend/prisma/schema.prisma`
```prisma
model Element {
  id           String   @id @default(cuid())
  type         String
  object_type  String   @default("character")  // Add this line
  // ... rest of existing fields
  
  @@index([object_type])  // Add this line
}
```

### Task 4: Base Context Builder (45 minutes)

**File**: `backend/src/services/contexts/BaseContext.ts`
```typescript
import prisma from '../../database';
import { PromptContext } from '../promptService';

export async function buildHierarchyContext(
  contextId: string,
  campaignId: string,
  objectType: string
): Promise<PromptContext> {
  const context: PromptContext = { USER_PROMPT: '' };

  try {
    // Get campaign info
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(campaignId) }
    });

    if (campaign) {
      context.CAMPAIGN_NAME = campaign.name;
      context.CAMPAIGN_DESCRIPTION = campaign.description;
    }

    // Get target element and its hierarchy
    const targetElement = await prisma.element.findUnique({
      where: { id: contextId },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true
              }
            }
          }
        }
      }
    });

    if (targetElement) {
      // Build hierarchy context
      let currentElement = targetElement;
      const hierarchy = [];

      while (currentElement) {
        hierarchy.unshift({
          name: currentElement.data.label || currentElement.data.name,
          type: currentElement.type,
          description: currentElement.data.description
        });
        currentElement = currentElement.parent;
      }

      // Assign context based on hierarchy level
      hierarchy.forEach((element, index) => {
        switch (index) {
          case 0: // Region level
            if (element.name) {
              context.REGION_NAME = element.name;
              context.REGION_DESCRIPTION = element.description;
            }
            break;
          case 1: // City level
            if (element.name) {
              context.CITY_NAME = element.name;
              context.CITY_DESCRIPTION = element.description;
            }
            break;
          case 2: // Area level
            if (element.name) {
              context.AREA_NAME = element.name;
              context.AREA_DESCRIPTION = element.description;
              context.AREA_TYPE = element.type;
            }
            break;
        }
      });
    }

    return context;
  } catch (error) {
    console.error('Error building hierarchy context:', error);
    return context;
  }
}
```

### Task 5: Frontend Type Definitions (30 minutes)

**File**: `frontend/src/types/objectTypes.ts`
```typescript
// Mirror the backend interfaces
export interface DisplayFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'stats' | 'list' | 'custom';
  priority: number;
  condition?: (data: any) => boolean;
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
```

## ⚡ Quick Validation (15 minutes)

After completing the above tasks, run these quick tests:

1. **Backend Compilation**
   ```bash
   cd backend
   npm run build
   ```

2. **Registry Test**
   ```typescript
   // Add to any backend file temporarily
   import { objectRegistry } from './config/objectRegistry';
   console.log('Registry initialized:', objectRegistry.getTypeNames());
   ```

3. **Frontend Compilation**
   ```bash
   cd frontend
   npm run build
   ```

## 📋 Ready for Phase 2

Once Phase 1 tasks are complete, you'll have:
- ✅ Core type system in place
- ✅ Object registry functioning
- ✅ Database schema updated
- ✅ Base context building system
- ✅ Frontend type definitions

**Estimated Time**: 4-5 hours
**Next Phase**: Generic Generation Service implementation

## 🔄 Validation Checklist

Before proceeding to Phase 2:

- [ ] ObjectTypeRegistry can register and retrieve definitions
- [ ] Database migration ran successfully
- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Base context builder returns valid context
- [ ] All new files are committed to git

## 🆘 Quick Troubleshooting

**Registry Error**: Ensure all imports are correct and singleton pattern is working
**Database Error**: Check Prisma schema is valid and migration applied
**Compilation Error**: Verify all TypeScript interfaces match between frontend/backend
**Import Error**: Check file paths and ensure all exports are named correctly

Ready to begin implementation? Start with Task 1 and work through sequentially! 