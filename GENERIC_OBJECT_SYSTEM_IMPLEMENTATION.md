# Generic Object Generation System - Implementation Plan

## 🎯 Project Overview

**Objective**: Transform the current character-specific LLM generation system into a fully generic, extensible object generation framework that supports any TTRPG object type (Characters, NPCs, Monsters, Areas, Items, etc.) with minimal developer effort.

**Current State**: Hardcoded character generation system with LLM integration
**Target State**: Generic object type registry system with configuration-driven generation

## 🏗️ Architecture Design

### Core Components

#### 1. Object Type Definition System
```typescript
interface ObjectTypeDefinition {
  // Identification
  name: string;                    // Internal identifier (e.g., 'character', 'monster')
  displayName: string;             // User-facing name (e.g., 'Character', 'Monster')
  pluralName: string;              // Plural form (e.g., 'Characters', 'Monsters')
  icon?: string;                   // Optional icon identifier
  
  // Generation Configuration
  promptTemplate: string;          // Template filename (e.g., 'character_generation.txt')
  zodSchema: ZodSchema;           // Runtime validation schema
  contextBuilder: ContextBuilder; // Function to build prompt context
  
  // UI Configuration
  nodeComponent?: React.ComponentType<NodeProps>; // Custom component (optional)
  displayFields: DisplayFieldConfig[];           // Fields to show in node
  editableFields: EditableFieldConfig[];         // Fields editable in modal
  
  // Metadata
  category: 'character' | 'location' | 'item' | 'lore'; // Grouping
  defaultData: Record<string, any>;                     // Default values
  permissions?: PermissionConfig;                       // Access control
}

interface DisplayFieldConfig {
  key: string;                    // Data field key
  label: string;                  // Display label
  type: 'text' | 'badge' | 'stats' | 'list' | 'custom';
  priority: number;               // Display order
  condition?: (data: any) => boolean; // Show condition
}

interface ContextBuilder {
  (contextId: string, campaignId: string, objectType: string): Promise<PromptContext>;
}
```

#### 2. Object Registry System
```typescript
class ObjectTypeRegistry {
  private definitions = new Map<string, ObjectTypeDefinition>();
  
  register(definition: ObjectTypeDefinition): void;
  get(objectType: string): ObjectTypeDefinition;
  getAll(): ObjectTypeDefinition[];
  getByCategory(category: string): ObjectTypeDefinition[];
  isValidType(objectType: string): boolean;
  
  // Dynamic registration from modules
  autoRegister(directory: string): Promise<void>;
}
```

#### 3. Generic Generation Service
```typescript
export class ObjectGenerationService {
  async generateObject(
    objectType: string,
    prompt: string,
    contextId: string,
    campaignId: string,
    provider?: string
  ): Promise<GeneratedObject>;
  
  async validateObjectData(objectType: string, data: any): Promise<any>;
  async persistObject(objectType: string, data: any, metadata: GenerationMetadata): Promise<Element>;
  async buildContext(objectType: string, contextId: string, campaignId: string): Promise<PromptContext>;
}
```

#### 4. Dynamic UI Components
```typescript
// Generic node component that adapts to object type
export const GenericObjectNode: React.FC<NodeProps & { objectType: string }>;

// Generic generation modal
export const ObjectGenerationModal: React.FC<{
  objectType: ObjectTypeDefinition;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, provider?: string) => void;
}>;

// Generic edit modal
export const ObjectEditModal: React.FC<{
  objectType: ObjectTypeDefinition;
  data: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}>;
```

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)
**Goal**: Build the foundation systems without breaking existing functionality

#### Backend Tasks:
1. **Object Type Registry**
   - Create `ObjectTypeDefinition` interface
   - Implement `ObjectTypeRegistry` class
   - Add registry initialization and validation

2. **Generic Context System**
   - Abstract context building from character-specific logic
   - Create pluggable context builder system
   - Implement base context builders (hierarchy, combat, social)

3. **Schema Management**
   - Create schema registry system
   - Add schema validation pipeline
   - Implement dynamic schema loading

4. **Database Abstraction**
   - Add `object_type` field to Element model
   - Create generic persistence layer
   - Add object type indexing

#### Frontend Tasks:
1. **Type System**
   - Define core TypeScript interfaces
   - Create object type hooks and utilities
   - Add validation helpers

2. **Registry Integration**
   - Create frontend object registry
   - Add object type loading system
   - Implement type-safe object access

### Phase 2: Generic Generation Service (Days 2-3)
**Goal**: Replace character-specific generation with generic system

#### Backend Tasks:
1. **Service Refactoring**
   - Replace `generateCharacter` with `generateObject`
   - Implement generic prompt processing
   - Add dynamic schema validation

2. **API Unification**
   - Create `/api/generate/:objectType` endpoint
   - Implement generic object CRUD operations
   - Add object type discovery endpoints

3. **Context Builder Framework**
   - Implement pluggable context system
   - Create standard context modules
   - Add context validation and merging

#### Frontend Tasks:
1. **API Integration**
   - Update API client for generic endpoints
   - Add object type parameter handling
   - Implement generic error handling

2. **Hook Refactoring**
   - Create `useObjectGeneration` hook
   - Replace character-specific logic
   - Add object type awareness

### Phase 3: Dynamic UI System (Days 3-4)
**Goal**: Create adaptive UI components that work with any object type

#### Frontend Tasks:
1. **Generic Node Component**
   - Create `GenericObjectNode` with adaptive rendering
   - Implement field type renderers (text, badges, stats, etc.)
   - Add conditional field display

2. **Modal System**
   - Build `ObjectGenerationModal` with type awareness
   - Create `ObjectEditModal` with dynamic forms
   - Add field validation and user feedback

3. **Context Menu Integration**
   - Make context menu object-type aware
   - Add dynamic action generation
   - Implement type-specific menu items

#### Backend Tasks:
1. **Metadata Enhancement**
   - Add object type metadata to responses
   - Implement type-specific serialization
   - Add performance optimizations

### Phase 4: Character Migration & Validation (Day 4)
**Goal**: Migrate existing character system to use generic framework

#### Tasks:
1. **Character Definition**
   - Create character object type definition
   - Migrate existing schemas and prompts
   - Test generation compatibility

2. **Data Migration**
   - Add object_type field to existing characters
   - Ensure backward compatibility
   - Validate existing character display

3. **Comprehensive Testing**
   - Test character generation through new system
   - Validate UI consistency
   - Performance testing

### Phase 5: New Object Types & Developer Experience (Day 5)
**Goal**: Demonstrate system extensibility and create developer tools

#### Object Type Implementations:
1. **NPC (Non-Player Character)**
   - Background, motivations, relationships
   - Social context building
   - Personality and dialogue focus

2. **Monster**
   - Combat stats, abilities, tactics
   - Challenge rating and balancing
   - Combat context building

3. **Area/Location**
   - World-building details, atmosphere
   - Geographic and historical context
   - Environmental storytelling

#### Developer Experience:
1. **Object Type Generator CLI**
   - `npm run generate:object-type` command
   - Template scaffolding
   - Automatic registration

2. **Documentation System**
   - Object type definition guide
   - Context builder tutorial
   - Best practices documentation

## 🔧 Technical Specifications

### Database Schema Changes

```sql
-- Add object_type to existing Element table
ALTER TABLE Element ADD COLUMN object_type VARCHAR(50) DEFAULT 'character';

-- Create index for object type queries
CREATE INDEX idx_element_object_type ON Element(object_type);

-- Update existing records
UPDATE Element SET object_type = 'character' WHERE type = 'character';
```

### File Structure

```
backend/src/
├── config/
│   ├── objectTypes/           # Object type definitions
│   │   ├── character.ts
│   │   ├── npc.ts
│   │   ├── monster.ts
│   │   └── area.ts
│   └── objectRegistry.ts      # Central registry
├── services/
│   ├── generation/
│   │   ├── ObjectGenerationService.ts
│   │   ├── ContextBuilderRegistry.ts
│   │   └── SchemaRegistry.ts
│   └── contexts/              # Context builder modules
│       ├── HierarchyContext.ts
│       ├── CombatContext.ts
│       └── SocialContext.ts
├── schemas/
│   ├── base/                  # Base schemas
│   │   ├── GeneratedObject.ts
│   │   └── ObjectMetadata.ts
│   └── objects/               # Object-specific schemas
│       ├── Character.ts
│       ├── NPC.ts
│       ├── Monster.ts
│       └── Area.ts
└── prompts/
    ├── character_generation.txt
    ├── npc_generation.txt
    ├── monster_generation.txt
    └── area_generation.txt

frontend/src/
├── types/
│   ├── objectTypes.ts         # Object type definitions
│   └── generatedObjects.ts    # Generated object types
├── hooks/
│   ├── useObjectGeneration.ts # Generic generation hook
│   ├── useObjectRegistry.ts   # Registry access hook
│   └── useObjectOperations.ts # CRUD operations hook
├── components/
│   ├── generation/
│   │   ├── ObjectGenerationModal.tsx
│   │   └── ObjectEditModal.tsx
│   ├── nodes/
│   │   ├── GenericObjectNode.tsx
│   │   └── FieldRenderers.tsx
│   └── registry/
│       └── ObjectTypeProvider.tsx
└── config/
    └── objectTypes/           # Frontend object type configs
        ├── character.ts
        ├── npc.ts
        ├── monster.ts
        └── area.ts
```

### API Endpoints

```typescript
// Generic object generation
POST /api/generate/:objectType
{
  "prompt": "A gruff tavern keeper with secrets",
  "contextId": "tavern_001", 
  "campaignId": "1",
  "provider": "gemini"
}

// Object type discovery
GET /api/object-types
GET /api/object-types/:objectType
GET /api/object-types/:objectType/schema

// Generic object operations
GET /api/objects/:objectType
POST /api/objects/:objectType
PUT /api/objects/:objectType/:id
DELETE /api/objects/:objectType/:id

// Context information
GET /api/context/:objectType/:contextId/:campaignId
```

### Example Object Type Definition

```typescript
// backend/src/config/objectTypes/npc.ts
import { z } from 'zod';
import { ObjectTypeDefinition } from '../types';
import { buildSocialContext } from '../contexts/SocialContext';

const NPCSchema = z.object({
  name: z.string(),
  description: z.string(),
  background: z.string(),
  personality: z.string(),
  motivations: z.array(z.string()),
  relationships: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    attitude: z.enum(['friendly', 'neutral', 'hostile'])
  })),
  secrets: z.array(z.string()).optional(),
  stats: z.object({
    influence: z.number().min(1).max(10),
    wealth: z.number().min(1).max(10),
    knowledge: z.number().min(1).max(10)
  }),
  dialogue: z.object({
    greeting: z.string(),
    catchphrase: z.string().optional(),
    speech_pattern: z.string()
  })
});

export const npcDefinition: ObjectTypeDefinition = {
  name: 'npc',
  displayName: 'NPC',
  pluralName: 'NPCs',
  category: 'character',
  promptTemplate: 'npc_generation.txt',
  zodSchema: NPCSchema,
  contextBuilder: buildSocialContext,
  displayFields: [
    { key: 'name', label: 'Name', type: 'text', priority: 1 },
    { key: 'background', label: 'Background', type: 'badge', priority: 2 },
    { key: 'description', label: 'Description', type: 'text', priority: 3 },
    { key: 'motivations', label: 'Motivations', type: 'list', priority: 4 },
    { key: 'stats', label: 'Social Stats', type: 'stats', priority: 5 }
  ],
  editableFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'background', label: 'Background', type: 'text' },
    { key: 'personality', label: 'Personality', type: 'textarea' },
    { key: 'motivations', label: 'Motivations', type: 'list' }
  ],
  defaultData: {
    stats: { influence: 5, wealth: 5, knowledge: 5 },
    relationships: [],
    motivations: []
  }
};
```

## 🎯 Success Criteria

### Technical Metrics
- [ ] Single generic endpoint handles all object types
- [ ] Adding new object type requires <100 lines of configuration code
- [ ] Zero code duplication between object types
- [ ] All existing character functionality preserved
- [ ] Performance within 10% of current system

### Developer Experience
- [ ] New object type can be added in <30 minutes
- [ ] Clear documentation and examples available
- [ ] Type safety maintained throughout system
- [ ] Hot-reload works for new object types
- [ ] Error messages are helpful and specific

### User Experience
- [ ] Consistent UI across all object types
- [ ] All LLM features (provider selection, analytics) work for all types
- [ ] Context menu adapts to object type
- [ ] Generation quality maintained or improved
- [ ] No breaking changes to existing workflows

## 🚨 Risk Mitigation

### Technical Risks
1. **Performance Degradation**
   - Mitigation: Benchmark at each phase, optimize critical paths
   - Rollback: Feature flags for generic vs. specific systems

2. **Type Safety Loss**
   - Mitigation: Extensive TypeScript interfaces, runtime validation
   - Rollback: Gradual typing with escape hatches

3. **Complexity Explosion**
   - Mitigation: Clear abstractions, comprehensive documentation
   - Rollback: Hybrid approach with fallbacks

### Business Risks
1. **Feature Regression**
   - Mitigation: Comprehensive test suite, gradual migration
   - Rollback: Parallel systems during transition

2. **Development Velocity**
   - Mitigation: Phased approach, early validation
   - Rollback: Complete rollback plan for each phase

## 🔄 Rollback Strategy

Each phase includes:
1. **Feature Flags**: Enable/disable new functionality
2. **Parallel Systems**: Old and new systems coexist
3. **Data Compatibility**: All changes are additive
4. **Checkpoint Testing**: Validation before proceeding
5. **Quick Rollback**: Single command to revert to previous phase

## 📊 Testing Strategy

### Unit Tests
- Object type registry operations
- Schema validation and transformation
- Context building functionality
- Generic service methods

### Integration Tests
- End-to-end object generation flow
- API endpoint functionality
- Database operations
- UI component rendering

### Performance Tests
- Generation speed comparison
- Memory usage analysis
- Database query optimization
- UI responsiveness testing

## 📝 Documentation Deliverables

1. **Developer Guide**: "Adding New Object Types"
2. **Architecture Overview**: System design and patterns
3. **API Reference**: Complete endpoint documentation
4. **Migration Guide**: Upgrading existing object types
5. **Best Practices**: Context building and schema design
6. **Troubleshooting**: Common issues and solutions

---

This implementation plan provides a complete roadmap for transforming the character-specific system into a fully generic, extensible object generation framework while maintaining all existing functionality and providing significant developer experience improvements. 