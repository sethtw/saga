import { z } from 'zod';
import { ObjectTypeDefinition } from '../../types/objectTypes';
import { buildHierarchyContext } from '../../services/contexts/BaseContext';

// Area-specific schema with environmental focus
const AreaGenerationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().optional(), // dungeon, city, wilderness, temple, etc.
  size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Vast']).optional(),
  climate: z.string().optional(),
  terrain: z.array(z.string()).optional(),
  atmosphere: z.string().optional(),
  history: z.string().optional(),
  inhabitants: z.array(z.object({
    name: z.string(),
    type: z.string(),
    population: z.string().optional()
  })).optional(),
  landmarks: z.array(z.object({
    name: z.string(),
    description: z.string()
  })).optional(),
  resources: z.array(z.string()).optional(),
  dangers: z.array(z.object({
    name: z.string(),
    description: z.string(),
    severity: z.enum(['Minor', 'Moderate', 'Major', 'Deadly']).optional()
  })).optional(),
  secrets: z.array(z.string()).optional(),
  connections: z.array(z.object({
    name: z.string(),
    direction: z.string(),
    distance: z.string().optional(),
    travelMethod: z.string().optional()
  })).optional(),
  events: z.array(z.object({
    name: z.string(),
    description: z.string(),
    frequency: z.string().optional()
  })).optional(),
  economy: z.object({
    primaryTrade: z.string().optional(),
    wealth: z.enum(['Destitute', 'Poor', 'Modest', 'Comfortable', 'Wealthy', 'Rich']).optional(),
    currency: z.string().optional()
  }).optional(),
  government: z.object({
    type: z.string().optional(),
    leader: z.string().optional(),
    laws: z.array(z.string()).optional()
  }).optional(),
  culture: z.object({
    customs: z.array(z.string()).optional(),
    festivals: z.array(z.string()).optional(),
    beliefs: z.string().optional()
  }).optional(),
  questHooks: z.array(z.string()).optional()
});

export const areaDefinition: ObjectTypeDefinition = {
  name: 'area',
  displayName: 'Area',
  pluralName: 'Areas',
  icon: 'map',
  category: 'location',
  promptTemplate: 'area_generation.txt',
  zodSchema: AreaGenerationSchema,
  contextBuilder: buildHierarchyContext,
  
  displayFields: [
    { key: 'name', label: 'Name', type: 'text', priority: 1 },
    { key: 'type', label: 'Type', type: 'badge', priority: 2 },
    { key: 'size', label: 'Size', type: 'badge', priority: 3 },
    { key: 'description', label: 'Description', type: 'text', priority: 4 },
    { key: 'atmosphere', label: 'Atmosphere', type: 'text', priority: 5 },
    { key: 'inhabitants', label: 'Inhabitants', type: 'list', priority: 6, condition: (data) => !!data.inhabitants?.length },
    { key: 'landmarks', label: 'Landmarks', type: 'list', priority: 7, condition: (data) => !!data.landmarks?.length },
    { key: 'dangers', label: 'Dangers', type: 'list', priority: 8, condition: (data) => !!data.dangers?.length },
    { key: 'resources', label: 'Resources', type: 'list', priority: 9, condition: (data) => !!data.resources?.length },
    { key: 'connections', label: 'Connections', type: 'list', priority: 10, condition: (data) => !!data.connections?.length }
  ],
  
  editableFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'type', label: 'Location Type', type: 'text' },
    { key: 'size', label: 'Size', type: 'select', options: ['Tiny', 'Small', 'Medium', 'Large', 'Vast'] },
    { key: 'climate', label: 'Climate', type: 'text' },
    { key: 'terrain', label: 'Terrain Types', type: 'list' },
    { key: 'atmosphere', label: 'Atmosphere', type: 'textarea' },
    { key: 'history', label: 'History', type: 'textarea' },
    { key: 'resources', label: 'Resources', type: 'list' },
    { key: 'questHooks', label: 'Quest Hooks', type: 'list' }
  ],
  
  defaultData: {
    size: 'Medium',
    terrain: [],
    inhabitants: [],
    landmarks: [],
    resources: [],
    dangers: [],
    secrets: [],
    connections: [],
    events: [],
    questHooks: [],
    economy: {},
    government: {},
    culture: {}
  },
  
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true
  }
}; 