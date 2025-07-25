import { z } from 'zod';
import { ObjectTypeDefinition } from '../../types/objectTypes';
import { buildHierarchyContext } from '../../services/contexts/BaseContext';

// Item-specific schema with equipment focus
const ItemGenerationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().optional(), // weapon, armor, tool, consumable, treasure, etc.
  category: z.string().optional(), // melee weapon, light armor, magic item, etc.
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']).optional(),
  value: z.object({
    amount: z.number().min(0).optional(),
    currency: z.string().optional()
  }).optional(),
  weight: z.number().min(0).optional(),
  properties: z.array(z.string()).optional(),
  magical: z.boolean().optional(),
  attunement: z.boolean().optional(),
  charges: z.object({
    current: z.number().min(0).optional(),
    maximum: z.number().min(0).optional(),
    recharge: z.string().optional()
  }).optional(),
  mechanics: z.object({
    armorClass: z.number().optional(),
    damage: z.string().optional(),
    attackBonus: z.number().optional(),
    damageBonus: z.number().optional(),
    savingThrowDC: z.number().optional(),
    range: z.string().optional()
  }).optional(),
  abilities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    usage: z.string().optional()
  })).optional(),
  history: z.string().optional(),
  creator: z.string().optional(),
  materials: z.array(z.string()).optional(),
  crafting: z.object({
    skill: z.string().optional(),
    dc: z.number().optional(),
    time: z.string().optional(),
    cost: z.string().optional(),
    components: z.array(z.string()).optional()
  }).optional(),
  questHooks: z.array(z.string()).optional(),
  curse: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    removalMethod: z.string().optional()
  }).optional()
});

export const itemDefinition: ObjectTypeDefinition = {
  name: 'item',
  displayName: 'Item',
  pluralName: 'Items',
  icon: 'package',
  category: 'item',
  promptTemplate: 'item_generation.txt',
  zodSchema: ItemGenerationSchema,
  contextBuilder: buildHierarchyContext,
  
  displayFields: [
    { key: 'name', label: 'Name', type: 'text', priority: 1 },
    { key: 'type', label: 'Type', type: 'badge', priority: 2 },
    { key: 'rarity', label: 'Rarity', type: 'badge', priority: 3 },
    { key: 'description', label: 'Description', type: 'text', priority: 4 },
    { key: 'value', label: 'Value', type: 'text', priority: 5, condition: (data) => !!data.value?.amount },
    { key: 'properties', label: 'Properties', type: 'list', priority: 6, condition: (data) => !!data.properties?.length },
    { key: 'abilities', label: 'Abilities', type: 'list', priority: 7, condition: (data) => !!data.abilities?.length },
    { key: 'mechanics', label: 'Mechanics', type: 'text', priority: 8, condition: (data) => !!Object.keys(data.mechanics || {}).length },
    { key: 'materials', label: 'Materials', type: 'list', priority: 9, condition: (data) => !!data.materials?.length },
    { key: 'curse', label: 'Curse', type: 'text', priority: 10, condition: (data) => !!data.curse?.name }
  ],
  
  editableFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'type', label: 'Item Type', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'rarity', label: 'Rarity', type: 'select', options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'] },
    { key: 'magical', label: 'Magical', type: 'text' },
    { key: 'attunement', label: 'Requires Attunement', type: 'text' },
    { key: 'properties', label: 'Properties', type: 'list' },
    { key: 'history', label: 'History', type: 'textarea' },
    { key: 'materials', label: 'Materials', type: 'list' },
    { key: 'questHooks', label: 'Quest Hooks', type: 'list' }
  ],
  
  defaultData: {
    rarity: 'Common',
    magical: false,
    attunement: false,
    weight: 0,
    properties: [],
    abilities: [],
    materials: [],
    questHooks: [],
    value: { amount: 0, currency: 'gp' },
    charges: {},
    mechanics: {},
    crafting: {},
    curse: {}
  },
  
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true
  }
}; 