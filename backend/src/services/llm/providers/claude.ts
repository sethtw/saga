import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMGenerationResponse, LLMGenerationOptions, LLMError, LLMAuthError, LLMRateLimitError } from '../types';
import { getProviderConfig } from '../../../config/llmConfig';

export class ClaudeProvider implements LLMProvider {
  public readonly name = 'claude';
  private client: Anthropic | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not found in environment variables');
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
    } catch (error) {
      console.error('Failed to initialize Claude provider:', error);
    }
  }

  async generate(prompt: string, options?: LLMGenerationOptions): Promise<LLMGenerationResponse> {
    if (!this.isAvailable()) {
      throw new LLMAuthError('claude');
    }

    const config = getProviderConfig('claude');
    if (!config) {
      throw new LLMError('Claude provider not configured', 'claude', 'CONFIG_ERROR');
    }

    const startTime = Date.now();
    const maxTokens = options?.maxTokens || config.maxTokens;
    const temperature = options?.temperature || config.temperature || 0.7;

    try {
      const message = await this.client!.messages.create({
        model: config.model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract content from Claude's response format
      const content = message.content[0];
      if (!content || content.type !== 'text') {
        throw new LLMError('Invalid response format from Claude', 'claude', 'INVALID_RESPONSE_FORMAT');
      }

      const textContent = content.text;
      if (!textContent) {
        throw new LLMError('Empty response from Claude', 'claude', 'EMPTY_RESPONSE');
      }

      const responseTimeMs = Date.now() - startTime;
      
      // Use actual token usage from API if available, otherwise estimate
      const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || this.estimateTokens(prompt + textContent);
      const costEstimate = (tokensUsed / 1000) * (config.costPer1kTokens || 0);

      return {
        content: textContent,
        provider: this.name,
        model: config.model,
        tokensUsed,
        costEstimate,
        responseTimeMs,
      };

    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;
      
      // Handle specific Anthropic errors
      if (error.status === 401) {
        throw new LLMAuthError('claude');
      }
      
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) : undefined;
        throw new LLMRateLimitError('claude', retryAfter);
      }

      if (error.status === 400 && error.message?.includes('max_tokens')) {
        throw new LLMError('Max tokens exceeded for Claude model', 'claude', 'MAX_TOKENS_EXCEEDED');
      }

      if (error.message?.includes('content_filtered')) {
        throw new LLMError('Content blocked by Claude safety filters', 'claude', 'CONTENT_FILTERED');
      }

      // Generic error
      throw new LLMError(
        `Claude generation failed: ${error.message}`,
        'claude',
        'GENERATION_ERROR'
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.ANTHROPIC_API_KEY;
  }

  estimateTokens(text: string): number {
    // Claude uses a similar tokenization to GPT models
    // Rough estimation: ~4 characters per token for English text
    // For production, you'd want to use Anthropic's token counting if available
    return Math.ceil(text.length / 4);
  }
} 