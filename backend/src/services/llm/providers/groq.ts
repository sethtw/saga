import Groq from 'groq-sdk';
import { LLMProvider, LLMGenerationResponse, LLMGenerationOptions, LLMError, LLMAuthError, LLMRateLimitError } from '../types';
import { getProviderConfig } from '../../../config/llmConfig';

export class GroqProvider implements LLMProvider {
  public readonly name = 'groq';
  private client: Groq | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('GROQ_API_KEY not found in environment variables');
      return;
    }

    try {
      this.client = new Groq({
        apiKey: apiKey,
      });
    } catch (error) {
      console.error('Failed to initialize Groq provider:', error);
    }
  }

  async generate(prompt: string, options?: LLMGenerationOptions): Promise<LLMGenerationResponse> {
    if (!this.isAvailable()) {
      throw new LLMAuthError('groq');
    }

    const config = getProviderConfig('groq');
    if (!config) {
      throw new LLMError('Groq provider not configured', 'groq', 'CONFIG_ERROR');
    }

    const startTime = Date.now();
    const maxTokens = options?.maxTokens || config.maxTokens;
    const temperature = options?.temperature || config.temperature || 0.7;

    try {
      const completion = await this.client!.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      }, {
        // Groq is very fast, so we can use a shorter timeout
        timeout: options?.timeout || 15000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError('Empty response from Groq', 'groq', 'EMPTY_RESPONSE');
      }

      const responseTimeMs = Date.now() - startTime;
      
      // Use actual token usage from API if available, otherwise estimate
      const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(prompt + content);
      const costEstimate = (tokensUsed / 1000) * (config.costPer1kTokens || 0); // Should be 0 for free tier

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
      
      // Handle specific Groq errors
      if (error.status === 401) {
        throw new LLMAuthError('groq');
      }
      
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) : undefined;
        throw new LLMRateLimitError('groq', retryAfter);
      }

      if (error.status === 400 && error.message?.includes('context_length')) {
        throw new LLMError('Prompt too long for Groq model', 'groq', 'CONTEXT_LENGTH_EXCEEDED');
      }

      if (error.status === 503) {
        throw new LLMError('Groq service temporarily unavailable', 'groq', 'SERVICE_UNAVAILABLE', true);
      }

      // Generic error
      throw new LLMError(
        `Groq generation failed: ${error.message}`,
        'groq',
        'GENERATION_ERROR'
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.GROQ_API_KEY;
  }

  estimateTokens(text: string): number {
    // Llama models use a similar tokenization approach
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
} 