import { z } from 'zod';

// Character stats schema
export const CharacterStatsSchema = z.object({
  str: z.number().int().min(1).max(20).optional(),
  dex: z.number().int().min(1).max(20).optional(),
  con: z.number().int().min(1).max(20).optional(),
  int: z.number().int().min(1).max(20).optional(),
  wis: z.number().int().min(1).max(20).optional(),
  cha: z.number().int().min(1).max(20).optional(),
  // Alternative: support other systems
  level: z.number().int().min(1).max(20).optional(),
  hp: z.number().int().min(1).optional(),
  ac: z.number().int().min(1).optional(),
}).strict();

// Character generation output schema
export const CharacterGenerationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  stats: CharacterStatsSchema.optional(),
  // Optional additional fields that LLMs might generate
  race: z.string().max(50).optional(),
  class: z.string().max(50).optional(),
  background: z.string().max(100).optional(),
  alignment: z.string().max(50).optional(),
  equipment: z.array(z.string()).optional(),
  personality: z.string().max(500).optional(),
}).strict();

// Item generation schema (for future expansion)
export const ItemGenerationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  type: z.string().max(50).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']).optional(),
  value: z.string().max(20).optional(), // e.g., "50 gp"
  weight: z.string().max(20).optional(), // e.g., "2 lbs"
  properties: z.array(z.string()).optional(),
}).strict();

// Location/Area generation schema (for future expansion)
export const LocationGenerationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  type: z.string().max(50).optional(), // tavern, shop, dungeon, etc.
  inhabitants: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  secrets: z.string().max(500).optional(),
}).strict();

// Generic generation response that can handle different types
export const GenerationResponseSchema = z.object({
  type: z.enum(['character', 'item', 'location']),
  data: z.union([
    CharacterGenerationSchema,
    ItemGenerationSchema,
    LocationGenerationSchema
  ])
});

// Type inference from schemas
export type CharacterStats = z.infer<typeof CharacterStatsSchema>;
export type CharacterGeneration = z.infer<typeof CharacterGenerationSchema>;
export type ItemGeneration = z.infer<typeof ItemGenerationSchema>;
export type LocationGeneration = z.infer<typeof LocationGenerationSchema>;
export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

// Validation functions
export const validateCharacterGeneration = (data: unknown): CharacterGeneration => {
  const result = CharacterGenerationSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid character generation data: ${result.error.message}`);
  }
  return result.data;
};

export const validateItemGeneration = (data: unknown): ItemGeneration => {
  const result = ItemGenerationSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid item generation data: ${result.error.message}`);
  }
  return result.data;
};

export const validateLocationGeneration = (data: unknown): LocationGeneration => {
  const result = LocationGenerationSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid location generation data: ${result.error.message}`);
  }
  return result.data;
};

// Helper function to parse JSON and validate
export const parseAndValidateCharacter = (jsonString: string): CharacterGeneration => {
  try {
    const parsed = JSON.parse(jsonString);
    return validateCharacterGeneration(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
    throw error;
  }
}; 