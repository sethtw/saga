import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMGenerationResponse, LLMGenerationOptions, LLMError, LLMAuthError, LLMRateLimitError } from '../types';
import { getProviderConfig } from '../../../config/llmConfig';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  private client: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_API_KEY not found in environment variables');
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      const config = getProviderConfig('gemini');
      if (config) {
        this.model = this.client.getGenerativeModel({ model: config.model });
      }
    } catch (error) {
      console.error('Failed to initialize Gemini provider:', error);
    }
  }

  async generate(prompt: string, options?: LLMGenerationOptions): Promise<LLMGenerationResponse> {
    if (!this.isAvailable()) {
      throw new LLMAuthError('gemini');
    }

    const config = getProviderConfig('gemini');
    if (!config) {
      throw new LLMError('Gemini provider not configured', 'gemini', 'CONFIG_ERROR');
    }

    const startTime = Date.now();
    const maxTokens = options?.maxTokens || config.maxTokens;
    const temperature = options?.temperature || config.temperature || 0.7;

    try {
      const generationConfig = {
        temperature,
        topK: 1,
        topP: 1,
        maxOutputTokens: maxTokens,
      };

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new LLMError('Empty response from Gemini', 'gemini', 'EMPTY_RESPONSE');
      }

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + content);
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
      
      // Handle specific Gemini errors
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new LLMAuthError('gemini');
      }
      
      if (error.message?.includes('RATE_LIMIT_EXCEEDED') || error.status === 429) {
        throw new LLMRateLimitError('gemini');
      }

      if (error.message?.includes('SAFETY')) {
        throw new LLMError('Content blocked by safety filters', 'gemini', 'SAFETY_ERROR');
      }

      // Generic error
      throw new LLMError(
        `Gemini generation failed: ${error.message}`,
        'gemini',
        'GENERATION_ERROR'
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.model !== null && !!process.env.GOOGLE_API_KEY;
  }

  estimateTokens(text: string): number {
    // Gemini uses a different tokenization, but we'll use a rough estimate
    // Based on the general rule: ~4 characters per token for English text
    // This is an approximation - for production, you'd want to use the actual tokenizer
    return Math.ceil(text.length / 4);
  }
} 