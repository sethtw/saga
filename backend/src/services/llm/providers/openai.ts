import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';
import { LLMProvider, LLMGenerationResponse, LLMGenerationOptions, LLMError, LLMAuthError, LLMRateLimitError } from '../types';
import { getProviderConfig } from '../../../config/llmConfig';

export class OpenAIProvider implements LLMProvider {
  public readonly name = 'openai';
  private client: OpenAI | null = null;
  private tokenizer: any = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not found in environment variables');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
      });

      // Initialize tiktoken for accurate token counting
      const config = getProviderConfig('openai');
      if (config && config.model.includes('gpt-4')) {
        this.tokenizer = encoding_for_model('gpt-4o' as any);
      } else {
        // Fallback for other models
        this.tokenizer = encoding_for_model('gpt-3.5-turbo' as any);
      }
    } catch (error) {
      console.error('Failed to initialize OpenAI provider:', error);
    }
  }

  async generate(prompt: string, options?: LLMGenerationOptions): Promise<LLMGenerationResponse> {
    if (!this.isAvailable()) {
      throw new LLMAuthError('openai');
    }

    const config = getProviderConfig('openai');
    if (!config) {
      throw new LLMError('OpenAI provider not configured', 'openai', 'CONFIG_ERROR');
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
        timeout: options?.timeout || 30000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError('Empty response from OpenAI', 'openai', 'EMPTY_RESPONSE');
      }

      const responseTimeMs = Date.now() - startTime;
      
      // Use actual token usage from API if available, otherwise estimate
      const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(prompt + content);
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
      
      // Handle specific OpenAI errors
      if (error.status === 401) {
        throw new LLMAuthError('openai');
      }
      
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) : undefined;
        throw new LLMRateLimitError('openai', retryAfter);
      }

      if (error.status === 400 && error.message?.includes('context_length_exceeded')) {
        throw new LLMError('Prompt too long for OpenAI model', 'openai', 'CONTEXT_LENGTH_EXCEEDED');
      }

      if (error.status === 400 && error.message?.includes('content_policy_violation')) {
        throw new LLMError('Content blocked by OpenAI content policy', 'openai', 'CONTENT_POLICY_VIOLATION');
      }

      // Generic error
      throw new LLMError(
        `OpenAI generation failed: ${error.message}`,
        'openai',
        'GENERATION_ERROR'
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.OPENAI_API_KEY;
  }

  estimateTokens(text: string): number {
    if (this.tokenizer) {
      try {
        const tokens = this.tokenizer.encode(text);
        return tokens.length;
      } catch (error) {
        console.warn('Failed to use tiktoken, falling back to estimation:', error);
      }
    }
    
    // Fallback estimation: roughly 4 characters per token
    return Math.ceil(text.length / 4);
  }
} 