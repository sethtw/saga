import { z } from 'zod';

// Request types
export interface LLMGenerationRequest {
  prompt: string;
  contextId: string;
  campaignId: string;
  provider?: string;
  maxTokens?: number;
  temperature?: number;
}

// Response types
export interface LLMGenerationResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  costEstimate: number;
  responseTimeMs: number;
}

// Usage tracking
export interface LLMUsageMetrics {
  provider: string;
  model: string;
  tokensUsed: number;
  costEstimate: number;
  responseTimeMs: number;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}

// Provider interface that all LLM providers must implement
export interface LLMProvider {
  name: string;
  
  /**
   * Generate content using the LLM
   * @param prompt The full prompt to send to the LLM
   * @param options Generation options (maxTokens, temperature, etc.)
   * @returns The generated response with metadata
   */
  generate(prompt: string, options?: LLMGenerationOptions): Promise<LLMGenerationResponse>;
  
  /**
   * Check if the provider is available and properly configured
   * @returns true if provider is ready to use
   */
  isAvailable(): boolean;
  
  /**
   * Estimate token count for a given text (for cost calculation)
   * @param text The text to count tokens for
   * @returns Estimated token count
   */
  estimateTokens(text: string): number;
}

// Options for LLM generation
export interface LLMGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

// Error types
export class LLMError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMRateLimitError extends LLMError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, 'RATE_LIMIT', true);
    this.retryAfter = retryAfter;
  }
  
  retryAfter?: number;
}

export class LLMAuthError extends LLMError {
  constructor(provider: string) {
    super(`Authentication failed for ${provider}`, provider, 'AUTH_ERROR', false);
  }
}

export class LLMInvalidResponseError extends LLMError {
  constructor(provider: string, response: string) {
    super(`Invalid response from ${provider}: ${response}`, provider, 'INVALID_RESPONSE', false);
  }
} 