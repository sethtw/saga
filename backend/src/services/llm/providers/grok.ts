import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { LLMProvider, LLMGenerationResponse, LLMGenerationOptions, LLMError, LLMAuthError, LLMRateLimitError } from '../types';
import { getProviderConfig } from '../../../config/llmConfig';

export class GrokProvider implements LLMProvider {
  public readonly name = 'grok';

  constructor() {
    // No initialization needed for xAI SDK
  }

  isAvailable(): boolean {
    const hasApiKey = !!process.env.GROK_API_KEY;
    if (!hasApiKey) {
      console.warn('GROK_API_KEY environment variable is not set');
    }
    return hasApiKey;
  }

  async generate(prompt: string, options?: LLMGenerationOptions): Promise<LLMGenerationResponse> {
    if (!this.isAvailable()) {
      throw new LLMAuthError('grok');
    }

    const config = getProviderConfig('grok');
    if (!config) {
      throw new LLMError('Grok provider not configured', 'grok', 'CONFIG_ERROR');
    }

    const startTime = Date.now();
    const maxTokens = options?.maxTokens || config.maxTokens;
    const temperature = options?.temperature || config.temperature || 0.7;

    try {
      console.log('Grok API call with:', { prompt, model: config.model, maxTokens, temperature });
      
      // Create xAI client with API key
      const xaiClient = createXai({
        apiKey: process.env.GROK_API_KEY,
      });

      // Use the proper xAI SDK pattern with generateText
      const result = await generateText({
        model: xaiClient(config.model),
        prompt: prompt,
        maxTokens: maxTokens,
        temperature: temperature,
      });

      console.log('Grok API response:', result);

      const content = result.text;
      if (!content) {
        console.log('Empty content from Grok, full response:', result);
        throw new LLMError('Empty response from Grok', 'grok', 'EMPTY_RESPONSE');
      }

      const responseTimeMs = Date.now() - startTime;
      
      // Use actual token usage from API if available, otherwise estimate
      const tokensUsed = result.usage?.totalTokens || this.estimateTokens(prompt + content);
      const costEstimate = (tokensUsed / 1000) * (config.costPer1kTokens || 0);

      return {
        content,
        provider: this.name,
        model: config.model,
        tokensUsed,
        costEstimate,
        responseTimeMs,
      };

    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;
      
      console.error('Grok error:', error);
      
      // Handle specific Grok errors
      if (error.status === 401 || error.message?.includes('401')) {
        throw new LLMAuthError('grok');
      }
      
      if (error.status === 429 || error.message?.includes('429')) {
        const retryAfter = error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) : undefined;
        throw new LLMRateLimitError('grok', retryAfter);
      }

      if (error.status === 400 && error.message?.includes('context_length')) {
        throw new LLMError('Prompt too long for Grok model', 'grok', 'CONTEXT_LENGTH_EXCEEDED');
      }

      if (error.status === 503) {
        throw new LLMError('Grok service temporarily unavailable', 'grok', 'SERVICE_UNAVAILABLE', true);
      }

      // Re-throw the original error if it's already an LLMError
      if (error instanceof LLMError) {
        throw error;
      }

      // Generic error
      throw new LLMError(
        `Grok generation failed: ${error.message}`,
        'grok',
        'GENERATION_ERROR'
      );
    }
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
} 