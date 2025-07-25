import prisma from '../../database';
import { Prisma } from '@prisma/client';
import { llmService } from '../llm/llmService';
import { promptService } from '../promptService';
import { objectRegistry } from '../../config/objectRegistry';
import { GeneratedObject, GenerationMetadata, ObjectContext } from '../../types/objectTypes';
import { LLMError } from '../llm/types';
import { parse } from 'yaml';

export class ObjectGenerationService {
  /**
   * Generate any object type using the registry system
   */
  async generateObject(
    objectType: string,
    prompt: string,
    contextId: string,
    campaignId: string,
    provider?: string
  ): Promise<GeneratedObject> {
    try {
      console.log(`🎯 Generating ${objectType} with context: ${contextId}`);
      
      // 1. Get object type definition from registry
      const objectDefinition = objectRegistry.get(objectType);
      
      // 2. Build context using the object's context builder
      const context = await this.buildContext(objectType, contextId, campaignId);
      context.USER_PROMPT = prompt;
      
      // 3. Generate prompt using the template
      const fullPrompt = this.assemblePrompt(objectDefinition.promptTemplate, context);
      
      console.log(`--- Assembled ${objectType} Prompt ---`);
      console.log(fullPrompt);
      
      // 4. Call LLM Service
      const llmResponse = await llmService.generate(fullPrompt, { provider });
      
      console.log(`--- LLM Response for ${objectType} ---`);
      console.log(`Provider: ${llmResponse.provider} (${llmResponse.model})`);
      console.log(`Tokens: ${llmResponse.tokensUsed}, Cost: $${llmResponse.costEstimate.toFixed(4)}, Time: ${llmResponse.responseTimeMs}ms`);
      
      // 5. Parse and validate using object's schema
      const validatedData = await this.validateObjectData(objectType, llmResponse.content);
      
      // 6. Persist to database with object_type
      const element = await this.persistObject(objectType, validatedData, {
        provider: llmResponse.provider,
        model: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        costEstimate: llmResponse.costEstimate,
        responseTimeMs: llmResponse.responseTimeMs,
        timestamp: new Date(),
        success: true
      }, contextId, campaignId);
      
      return {
        id: element.id,
        objectType,
        data: validatedData,
        metadata: {
          provider: llmResponse.provider,
          model: llmResponse.model,
          tokensUsed: llmResponse.tokensUsed,
          costEstimate: llmResponse.costEstimate,
          responseTimeMs: llmResponse.responseTimeMs,
          timestamp: new Date()
        }
      };
      
    } catch (error) {
      console.error(`${objectType} generation failed:`, error);
      
      if (error instanceof LLMError) {
        throw new Error(`LLM Error (${error.provider}): ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Extract JSON from LLM response (handles markdown code blocks)
   */
  private extractJsonFromResponse(response: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json|yaml)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    
    // Look for JSON object that starts with { and ends with }
    const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return jsonObjectMatch[0].trim();
    }
    
    // If no patterns found, return the response as-is
    return response.trim();
  }

  /**
   * Validate object data using the object type's schema
   */
  async validateObjectData(objectType: string, jsonString: string): Promise<any> {
    try {
      const objectDefinition = objectRegistry.get(objectType);
      
      // Extract JSON from markdown code blocks if present
      const cleanJsonString = this.extractJsonFromResponse(jsonString);
      console.log(`--- Extracted JSON for ${objectType} ---`);
      console.log(cleanJsonString);
      
      const parsed = parse(cleanJsonString);
      
      // Use zod schema for validation
      const result = objectDefinition.zodSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error(`Invalid ${objectType} data: ${result.error.message}`);
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON response for ${objectType}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Persist object to database with object_type
   */
  async persistObject(
    objectType: string,
    data: any,
    metadata: GenerationMetadata,
    contextId: string,
    campaignId: string
  ): Promise<any> {
    const newElement = await prisma.mapElement.create({
      data: {
        campaignId: parseInt(campaignId, 10),
        parentElementId: contextId,
        type: objectType, // Keep for backward compatibility
        objectType: objectType, // New field for generic system
        positionX: 150, // Default position - frontend will handle placement
        positionY: 250,
        data: data as Prisma.InputJsonValue,
        id: `${objectType}_${new Date().getTime()}`,
      },
    });

    return {
      ...newElement,
      llmMetadata: {
        provider: metadata.provider,
        model: metadata.model,
        tokensUsed: metadata.tokensUsed,
        costEstimate: metadata.costEstimate,
        responseTimeMs: metadata.responseTimeMs,
      }
    };
  }

  /**
   * Build context using the object type's context builder
   */
  async buildContext(objectType: string, contextId: string, campaignId: string): Promise<ObjectContext> {
    const objectDefinition = objectRegistry.get(objectType);
    const context = await objectDefinition.contextBuilder(contextId, campaignId, objectType);
    
    // Ensure required properties are present
    if (!context.USER_PROMPT) {
      context.USER_PROMPT = '';
    }
    if (!context.OBJECT_TYPE) {
      context.OBJECT_TYPE = objectType;
    }
    
    return context as ObjectContext;
  }

  /**
   * Assemble prompt using template and context
   */
  private assemblePrompt(templateName: string, context: ObjectContext): string {
    // Use the generic prompt generation method
    const templateNameWithoutExtension = templateName.replace('.txt', '');
    return promptService.generatePrompt(templateNameWithoutExtension, context);
  }

  /**
   * Get available object types
   */
  getAvailableObjectTypes(): string[] {
    return objectRegistry.getTypeNames();
  }

  /**
   * Get object type definition
   */
  getObjectTypeDefinition(objectType: string) {
    return objectRegistry.get(objectType);
  }

  /**
   * Check if object type is valid
   */
  isValidObjectType(objectType: string): boolean {
    return objectRegistry.isValidType(objectType);
  }
}

// Export singleton instance
export const objectGenerationService = new ObjectGenerationService(); 