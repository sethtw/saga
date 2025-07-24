import prisma from '../database';
import { Prisma } from '@prisma/client';
import { llmService } from './llm/llmService';
import { promptService, PromptContext } from './promptService';
import { parseAndValidateCharacter } from './llm/schemas';
import { LLMError } from './llm/types';

export const generateCharacter = async (
  prompt: string, 
  contextId: string, 
  campaignId: string,
  provider?: string
) => {
  try {
    // 1. Construct Context - Get hierarchical context from database
    const context = await buildContextFromDatabase(contextId, campaignId);
    
    // 2. Add user prompt to context
    context.USER_PROMPT = prompt;

    // 3. Generate full prompt from template
    const fullPrompt = promptService.generateCharacterPrompt(context);
    
    console.log('--- Assembled Prompt ---');
    console.log(fullPrompt);
    
    // 4. Call LLM Service
    const llmResponse = await llmService.generate(fullPrompt, { provider });
    
    console.log('--- LLM Response ---');
    console.log(`Provider: ${llmResponse.provider} (${llmResponse.model})`);
    console.log(`Tokens: ${llmResponse.tokensUsed}, Cost: $${llmResponse.costEstimate.toFixed(4)}, Time: ${llmResponse.responseTimeMs}ms`);
    console.log('Content:', llmResponse.content);
    
    // 5. Parse and validate the response
    const characterData = parseAndValidateCharacter(llmResponse.content);
    
    // 6. Persist Data
    const newElement = await prisma.mapElement.create({
      data: {
        campaignId: parseInt(campaignId, 10),
        parentElementId: contextId,
        type: 'character',
        positionX: 150, // Default position - frontend will handle placement
        positionY: 250,
        data: characterData as Prisma.InputJsonValue,
        id: `char_${new Date().getTime()}`,
      },
    });

    return {
      ...newElement,
      llmMetadata: {
        provider: llmResponse.provider,
        model: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        costEstimate: llmResponse.costEstimate,
        responseTimeMs: llmResponse.responseTimeMs,
      }
    };
    
  } catch (error) {
    console.error('Character generation failed:', error);
    
    if (error instanceof LLMError) {
      throw new Error(`LLM Error (${error.provider}): ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Build hierarchical context from database by traversing up the element tree
 */
async function buildContextFromDatabase(contextId: string, campaignId: string): Promise<PromptContext> {
  const context: PromptContext = {
    USER_PROMPT: '' // Will be set later
  };

  // Get campaign info
  const campaign = await prisma.campaign.findUnique({
    where: { id: parseInt(campaignId, 10) },
  });

  if (campaign) {
    context.CAMPAIGN_NAME = campaign.name;
    context.CAMPAIGN_DESCRIPTION = campaign.description || undefined;
  }

  // Get the target element (usually a room/area)
  const targetElement = await prisma.mapElement.findUnique({
    where: { id: contextId },
  });

  if (targetElement && targetElement.data) {
    const elementData = targetElement.data as any;
    context.AREA_NAME = elementData.label || elementData.name;
    context.AREA_DESCRIPTION = elementData.description;
    context.AREA_TYPE = targetElement.type || undefined;
  }

  // Walk up the hierarchy to find parent context (city, region, etc.)
  let currentElement = targetElement;
  while (currentElement?.parentElementId) {
    const parentElement = await prisma.mapElement.findUnique({
      where: { id: currentElement.parentElementId },
    });

    if (parentElement && parentElement.data) {
      const parentData = parentElement.data as any;
      
      // Determine what type of parent this is and set appropriate context
      if (parentElement.type === 'city' || parentElement.type === 'settlement') {
        context.CITY_NAME = parentData.label || parentData.name;
        context.CITY_DESCRIPTION = parentData.description;
      } else if (parentElement.type === 'region' || parentElement.type === 'area') {
        context.REGION_NAME = parentData.label || parentData.name;
        context.REGION_DESCRIPTION = parentData.description;
      }
    }
    
    currentElement = parentElement;
  }

  return context;
} 