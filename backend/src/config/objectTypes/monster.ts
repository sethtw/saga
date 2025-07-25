import { z } from 'zod';
import { ObjectTypeDefinition } from '../../types/objectTypes';
import { buildHierarchyContext } from '../../services/contexts/BaseContext';

// Monster-specific schema with combat focus
const MonsterGenerationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().optional(), // creature type (beast, humanoid, undead, etc.)
  size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']).optional(),
  alignment: z.string().optional(),
  armorClass: z.number().min(1).max(30).optional(),
  hitPoints: z.number().min(1).max(1000).optional(),
  speed: z.object({
    walk: z.number().optional(),
    fly: z.number().optional(),
    swim: z.number().optional(),
    climb: z.number().optional()
  }).optional(),
  abilities: z.object({
    strength: z.number().min(1).max(30).default(10),
    dexterity: z.number().min(1).max(30).default(10),
    constitution: z.number().min(1).max(30).default(10),
    intelligence: z.number().min(1).max(30).default(10),
    wisdom: z.number().min(1).max(30).default(10),
    charisma: z.number().min(1).max(30).default(10)
  }).optional(),
  savingThrows: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  damageResistances: z.array(z.string()).optional(),
  damageImmunities: z.array(z.string()).optional(),
  conditionImmunities: z.array(z.string()).optional(),
  senses: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  challengeRating: z.string().optional(), // e.g. "1/4", "2", "5"
  proficiencyBonus: z.number().min(1).max(10).optional(),
  specialAbilities: z.array(z.object({
    name: z.string(),
    description: z.string()
  })).optional(),
  actions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    attackBonus: z.number().optional(),
    damage: z.string().optional()
  })).optional(),
  legendaryActions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    cost: z.number().optional()
  })).optional(),
  tactics: z.string().optional(),
  habitat: z.string().optional(),
  loot: z.array(z.string()).optional()
});

export const monsterDefinition: ObjectTypeDefinition = {
  name: 'monster',
  displayName: 'Monster',
  pluralName: 'Monsters',
  icon: 'skull',
  category: 'character',
  promptTemplate: 'monster_generation.txt',
  zodSchema: MonsterGenerationSchema,
  contextBuilder: buildHierarchyContext,
  
  displayFields: [
    { key: 'name', label: 'Name', type: 'text', priority: 1 },
    { key: 'type', label: 'Type', type: 'badge', priority: 2 },
    { key: 'size', label: 'Size', type: 'badge', priority: 3 },
    { key: 'challengeRating', label: 'CR', type: 'badge', priority: 4 },
    { key: 'description', label: 'Description', type: 'text', priority: 5 },
    { key: 'abilities', label: 'Abilities', type: 'stats', priority: 6 },
    { key: 'armorClass', label: 'AC', type: 'text', priority: 7 },
    { key: 'hitPoints', label: 'HP', type: 'text', priority: 8 },
    { key: 'specialAbilities', label: 'Special Abilities', type: 'list', priority: 9, condition: (data) => !!data.specialAbilities?.length },
    { key: 'actions', label: 'Actions', type: 'list', priority: 10, condition: (data) => !!data.actions?.length }
  ],
  
  editableFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'type', label: 'Creature Type', type: 'text' },
    { key: 'size', label: 'Size', type: 'select', options: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] },
    { key: 'alignment', label: 'Alignment', type: 'text' },
    { key: 'challengeRating', label: 'Challenge Rating', type: 'text' },
    { key: 'armorClass', label: 'Armor Class', type: 'number' },
    { key: 'hitPoints', label: 'Hit Points', type: 'number' },
    { key: 'tactics', label: 'Combat Tactics', type: 'textarea' },
    { key: 'habitat', label: 'Habitat', type: 'text' },
    { key: 'loot', label: 'Potential Loot', type: 'list' }
  ],
  
  defaultData: {
    size: 'Medium',
    alignment: 'Neutral',
    abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    speed: { walk: 30 },
    armorClass: 10,
    hitPoints: 10,
    challengeRating: '1/4',
    proficiencyBonus: 2,
    specialAbilities: [],
    actions: [],
    legendaryActions: [],
    savingThrows: [],
    skills: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: [],
    languages: [],
    loot: []
  },
  
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true
  }
}; 