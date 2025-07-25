import { z } from 'zod';
import { ObjectTypeDefinition } from '../../types/objectTypes';
import { buildHierarchyContext } from '../../services/contexts/BaseContext';

// NPC-specific schema with social focus
const NPCGenerationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  background: z.string().optional(),
  occupation: z.string().optional(),
  personality: z.string().optional(),
  motivations: z.array(z.string()).optional(),
  relationships: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    attitude: z.enum(['friendly', 'neutral', 'hostile', 'unknown'])
  })).optional(),
  secrets: z.array(z.string()).optional(),
  socialStats: z.object({
    influence: z.number().min(1).max(10).default(5),
    wealth: z.number().min(1).max(10).default(5),
    knowledge: z.number().min(1).max(10).default(5),
    charisma: z.number().min(1).max(10).default(5)
  }).optional(),
  dialogue: z.object({
    greeting: z.string().optional(),
    catchphrase: z.string().optional(),
    speechPattern: z.string().optional()
  }).optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  questHooks: z.array(z.string()).optional()
});

export const npcDefinition: ObjectTypeDefinition = {
  name: 'npc',
  displayName: 'NPC',
  pluralName: 'NPCs',
  icon: 'users',
  category: 'character',
  promptTemplate: 'npc_generation.txt',
  zodSchema: NPCGenerationSchema,
  contextBuilder: buildHierarchyContext,
  
  displayFields: [
    { key: 'name', label: 'Name', type: 'text', priority: 1 },
    { key: 'occupation', label: 'Occupation', type: 'badge', priority: 2 },
    { key: 'description', label: 'Description', type: 'text', priority: 3 },
    { key: 'socialStats', label: 'Social Stats', type: 'stats', priority: 4 },
    { key: 'motivations', label: 'Motivations', type: 'list', priority: 5, condition: (data) => !!data.motivations?.length },
    { key: 'relationships', label: 'Relationships', type: 'list', priority: 6, condition: (data) => !!data.relationships?.length },
    { key: 'dialogue.greeting', label: 'Greeting', type: 'text', priority: 7, condition: (data) => !!data.dialogue?.greeting },
    { key: 'location', label: 'Location', type: 'badge', priority: 8, condition: (data) => !!data.location }
  ],
  
  editableFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'occupation', label: 'Occupation', type: 'text' },
    { key: 'background', label: 'Background', type: 'textarea' },
    { key: 'personality', label: 'Personality', type: 'textarea' },
    { key: 'motivations', label: 'Motivations', type: 'list' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'availability', label: 'Availability', type: 'text' },
    { key: 'questHooks', label: 'Quest Hooks', type: 'list' }
  ],
  
  defaultData: {
    socialStats: { influence: 5, wealth: 5, knowledge: 5, charisma: 5 },
    relationships: [],
    motivations: [],
    secrets: [],
    questHooks: [],
    dialogue: {}
  },
  
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true
  }
}; 