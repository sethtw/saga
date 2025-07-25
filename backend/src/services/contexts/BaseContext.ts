import prisma from '../../database';
import { ObjectContext } from '../../types/objectTypes';

// Re-export PromptContext for compatibility
export interface PromptContext extends ObjectContext {}

/**
 * Base class for context builders
 */
export abstract class BaseContextBuilder {
  abstract build(contextId: string, campaignId: string, objectType: string): Promise<ObjectContext>;
  
  protected async getCampaignInfo(campaignId: string): Promise<Partial<ObjectContext>> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: parseInt(campaignId) }
      });

      if (campaign) {
        return {
          CAMPAIGN_NAME: campaign.name,
          CAMPAIGN_DESCRIPTION: campaign.description || undefined
        };
      }
      return {};
    } catch (error) {
      console.error('Error getting campaign info:', error);
      return {};
    }
  }

  protected async getElementHierarchy(contextId: string): Promise<any[]> {
    try {
      const targetElement = await prisma.mapElement.findUnique({
        where: { id: contextId }
      });

      if (!targetElement) return [];

      // Build hierarchy by following parent chain
      const hierarchy = [];
      let currentElement: typeof targetElement | null = targetElement;

      while (currentElement) {
        hierarchy.unshift({
          id: currentElement.id,
          name: (currentElement.data as any)?.label || (currentElement.data as any)?.name || 'Unknown',
          type: currentElement.type || 'unknown',
          description: (currentElement.data as any)?.description || '',
          data: currentElement.data
        });

        // Get parent element if parentElementId exists
        if (currentElement.parentElementId) {
          currentElement = await prisma.mapElement.findUnique({
            where: { id: currentElement.parentElementId }
          });
        } else {
          currentElement = null;
        }
      }

      return hierarchy;
    } catch (error) {
      console.error('Error building element hierarchy:', error);
      return [];
    }
  }

  protected createBaseContext(objectType: string): ObjectContext {
    return {
      USER_PROMPT: '',
      OBJECT_TYPE: objectType
    };
  }
}

/**
 * Hierarchical context builder - focuses on spatial/location hierarchy
 */
export class HierarchyContextBuilder extends BaseContextBuilder {
  async build(contextId: string, campaignId: string, objectType: string): Promise<ObjectContext> {
    const context = this.createBaseContext(objectType);

    try {
      // Get campaign information
      const campaignInfo = await this.getCampaignInfo(campaignId);
      Object.assign(context, campaignInfo);

      // Get element hierarchy
      const hierarchy = await this.getElementHierarchy(contextId);

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
              context.AREA_TYPE = element.type || undefined;
            }
            break;
        }
      });

      return context;
    } catch (error) {
      console.error('Error building hierarchy context:', error);
      return context;
    }
  }
}

/**
 * Social context builder - focuses on relationships and social dynamics
 */
export class SocialContextBuilder extends BaseContextBuilder {
  async build(contextId: string, campaignId: string, objectType: string): Promise<ObjectContext> {
    const context = this.createBaseContext(objectType);

    try {
      // Get base hierarchy context
      const hierarchyBuilder = new HierarchyContextBuilder();
      const hierarchyContext = await hierarchyBuilder.build(contextId, campaignId, objectType);
      Object.assign(context, hierarchyContext);

      // Add social-specific context
      const hierarchy = await this.getElementHierarchy(contextId);
      const targetElement = hierarchy[hierarchy.length - 1];

      if (targetElement) {
        // Determine social setting
        if (targetElement.type === 'tavern' || targetElement.type === 'inn') {
          context.SOCIAL_SETTING = 'tavern';
          context.SOCIAL_ATMOSPHERE = 'lively, social gathering place';
        } else if (targetElement.type === 'shop' || targetElement.type === 'market') {
          context.SOCIAL_SETTING = 'commercial';
          context.SOCIAL_ATMOSPHERE = 'business-focused, transactional';
        } else if (targetElement.type === 'temple' || targetElement.type === 'shrine') {
          context.SOCIAL_SETTING = 'religious';
          context.SOCIAL_ATMOSPHERE = 'reverent, spiritual';
        } else if (targetElement.type === 'palace' || targetElement.type === 'castle') {
          context.SOCIAL_SETTING = 'noble';
          context.SOCIAL_ATMOSPHERE = 'formal, hierarchical';
        } else {
          context.SOCIAL_SETTING = 'general';
          context.SOCIAL_ATMOSPHERE = 'varied social interactions';
        }
      }

      return context;
    } catch (error) {
      console.error('Error building social context:', error);
      return context;
    }
  }
}

/**
 * Combat context builder - focuses on tactical and combat situations
 */
export class CombatContextBuilder extends BaseContextBuilder {
  async build(contextId: string, campaignId: string, objectType: string): Promise<ObjectContext> {
    const context = this.createBaseContext(objectType);

    try {
      // Get base hierarchy context
      const hierarchyBuilder = new HierarchyContextBuilder();
      const hierarchyContext = await hierarchyBuilder.build(contextId, campaignId, objectType);
      Object.assign(context, hierarchyContext);

      // Add combat-specific context
      const hierarchy = await this.getElementHierarchy(contextId);
      const targetElement = hierarchy[hierarchy.length - 1];

      if (targetElement) {
        // Determine combat environment
        if (targetElement.type === 'dungeon' || targetElement.type === 'cave') {
          context.COMBAT_ENVIRONMENT = 'underground';
          context.TACTICAL_CONSIDERATIONS = 'confined spaces, limited visibility';
        } else if (targetElement.type === 'forest' || targetElement.type === 'wilderness') {
          context.COMBAT_ENVIRONMENT = 'wilderness';
          context.TACTICAL_CONSIDERATIONS = 'natural cover, varied terrain';
        } else if (targetElement.type === 'city' || targetElement.type === 'town') {
          context.COMBAT_ENVIRONMENT = 'urban';
          context.TACTICAL_CONSIDERATIONS = 'buildings, civilians, guards';
        } else if (targetElement.type === 'castle' || targetElement.type === 'fortress') {
          context.COMBAT_ENVIRONMENT = 'fortified';
          context.TACTICAL_CONSIDERATIONS = 'defensive positions, choke points';
        } else {
          context.COMBAT_ENVIRONMENT = 'general';
          context.TACTICAL_CONSIDERATIONS = 'standard combat considerations';
        }

        // Add threat level based on area type
        const dangerousAreas = ['dungeon', 'cave', 'wilderness', 'ruins'];
        context.THREAT_LEVEL = dangerousAreas.includes(targetElement.type) ? 'high' : 'moderate';
      }

      return context;
    } catch (error) {
      console.error('Error building combat context:', error);
      return context;
    }
  }
}

// Default context builder factory
export function createContextBuilder(type: 'hierarchy' | 'social' | 'combat' = 'hierarchy'): BaseContextBuilder {
  switch (type) {
    case 'social':
      return new SocialContextBuilder();
    case 'combat':
      return new CombatContextBuilder();
    case 'hierarchy':
    default:
      return new HierarchyContextBuilder();
  }
}

// Convenience function for backward compatibility
export async function buildHierarchyContext(
  contextId: string,
  campaignId: string,
  objectType: string
): Promise<PromptContext> {
  const builder = new HierarchyContextBuilder();
  return builder.build(contextId, campaignId, objectType);
}

// New convenience functions for different context types
export async function buildSocialContext(
  contextId: string,
  campaignId: string,
  objectType: string
): Promise<ObjectContext> {
  const builder = new SocialContextBuilder();
  return builder.build(contextId, campaignId, objectType);
}

export async function buildCombatContext(
  contextId: string,
  campaignId: string,
  objectType: string
): Promise<ObjectContext> {
  const builder = new CombatContextBuilder();
  return builder.build(contextId, campaignId, objectType);
} 