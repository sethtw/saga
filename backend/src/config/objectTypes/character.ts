import { z } from 'zod';
import { ObjectTypeDefinition } from '../../types/objectTypes';
import { buildHierarchyContext } from '../../services/contexts/BaseContext';

// Import existing character schema
const CharacterStatsSchema = z.object({
  str: z.number().int().min(1).max(20).optional(),
  dex: z.number().int().min(1).max(20).optional(),
  con: z.number().int().min(1).max(20).optional(),
  int: z.number().int().min(1).max(20).optional(),
  wis: z.number().int().min(1).max(20).optional(),
  cha: z.number().int().min(1).max(20).optional(),
  level: z.number().int().min(1).max(20).optional(),
  hp: z.number().int().min(1).optional(),
  ac: z.number().int().min(1).optional(),
}).strict();

const CharacterGenerationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  stats: CharacterStatsSchema.optional(),
  race: z.string().max(50).optional(),
  class: z.string().max(50).optional(),
  background: z.string().max(2000).optional(),
  alignment: z.string().max(50).optional(),
  equipment: z.array(z.string()).optional(),
  personality: z.string().max(500).optional(),
}).strict();

export const characterDefinition: ObjectTypeDefinition = {
  name: 'character',
  displayName: 'Character',
  pluralName: 'Characters',
  icon: 'user',
  category: 'character',
  promptTemplate: 'character_generation.txt',
  zodSchema: CharacterGenerationSchema,
  contextBuilder: buildHierarchyContext,
  
  displayFields: [
    { key: 'name', label: 'Name', type: 'text', priority: 1 },
    { key: 'race', label: 'Race', type: 'badge', priority: 2 },
    { key: 'class', label: 'Class', type: 'badge', priority: 3 },
    { key: 'description', label: 'Description', type: 'text', priority: 4 },
    { key: 'stats', label: 'Stats', type: 'stats', priority: 5 },
    { key: 'personality', label: 'Personality', type: 'text', priority: 6, condition: (data) => !!data.personality },
    { key: 'equipment', label: 'Equipment', type: 'list', priority: 7, condition: (data) => !!data.equipment?.length }
  ],
  
  editableFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'race', label: 'Race', type: 'text' },
    { key: 'class', label: 'Class', type: 'text' },
    { key: 'background', label: 'Background', type: 'text' },
    { key: 'alignment', label: 'Alignment', type: 'select', options: [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ]},
    { key: 'personality', label: 'Personality', type: 'textarea' },
    { key: 'equipment', label: 'Equipment', type: 'list' }
  ],
  
  defaultData: {
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    equipment: [],
    alignment: 'True Neutral'
  },
  
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true
  }
}; 