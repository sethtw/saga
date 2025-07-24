import { LLMProvider, LLMGenerationRequest, LLMGenerationResponse, LLMError, LLMUsageMetrics } from './types';
import { llmConfig, getEnabledProviders, isValidProvider } from '../../config/llmConfig';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { ClaudeProvider } from './providers/claude';
import { GroqProvider } from './providers/groq';

export class LLMService {
  private providers: Map<string, LLMProvider> = new Map();
  private usageMetrics: LLMUsageMetrics[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize all available providers
    const gemini = new GeminiProvider();
    const openai = new OpenAIProvider();
    const claude = new ClaudeProvider();
    const groq = new GroqProvider();

    // Only register providers that are available (have proper API keys)
    if (gemini.isAvailable()) {
      this.providers.set('gemini', gemini);
    }
    if (openai.isAvailable()) {
      this.providers.set('openai', openai);
    }
    if (claude.isAvailable()) {
      this.providers.set('claude', claude);
    }
    if (groq.isAvailable()) {
      this.providers.set('groq', groq);
    }

    console.log(`LLM Service initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`);
  }

  /**
   * Get the best available provider based on request preferences and configuration
   */
  private selectProvider(requestedProvider?: string): LLMProvider {
    // If a specific provider is requested and it's available, use it
    if (requestedProvider && this.providers.has(requestedProvider) && isValidProvider(requestedProvider)) {
      return this.providers.get(requestedProvider)!;
    }

    // Fall back to default provider if available
    const defaultProvider = llmConfig.defaultProvider;
    if (this.providers.has(defaultProvider) && isValidProvider(defaultProvider)) {
      return this.providers.get(defaultProvider)!;
    }

    // Fall back to any available provider
    const enabledProviders = getEnabledProviders().filter(name => this.providers.has(name));
    if (enabledProviders.length > 0) {
      return this.providers.get(enabledProviders[0])!;
    }

    throw new LLMError(
      'No LLM providers are available. Please check your API keys and configuration.',
      'system',
      'NO_PROVIDERS_AVAILABLE'
    );
  }

  /**
   * Generate content using the best available LLM provider
   */
  async generate(prompt: string, options?: {
    provider?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<LLMGenerationResponse> {
    const provider = this.selectProvider(options?.provider);
    const startTime = Date.now();
    let success = false;
    let errorType: string | undefined;

    try {
      const response = await provider.generate(prompt, {
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      });

      success = true;
      
      // Record usage metrics
      this.recordUsage({
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        costEstimate: response.costEstimate,
        responseTimeMs: response.responseTimeMs,
        timestamp: new Date(),
        success: true,
      });

      return response;

    } catch (error: any) {
      errorType = error.code || 'UNKNOWN_ERROR';
      
      // Record failed usage
      this.recordUsage({
        provider: provider.name,
        model: 'unknown',
        tokensUsed: 0,
        costEstimate: 0,
        responseTimeMs: Date.now() - startTime,
        timestamp: new Date(),
        success: false,
        errorType,
      });

      throw error;
    }
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): Array<{ name: string; model: string; available: boolean; enabled: boolean }> {
    const allProviders = ['gemini', 'openai', 'claude', 'groq'];
    
    return allProviders.map(name => {
      const provider = this.providers.get(name);
      const config = llmConfig.providers[name];
      
      return {
        name,
        model: config?.model || 'unknown',
        available: provider?.isAvailable() || false,
        enabled: config?.enabled || false,
      };
    });
  }

  /**
   * Record usage metrics for monitoring and cost tracking
   */
  private recordUsage(metrics: LLMUsageMetrics): void {
    this.usageMetrics.push(metrics);
    
    // Keep only the last 1000 metrics to prevent memory issues
    if (this.usageMetrics.length > 1000) {
      this.usageMetrics = this.usageMetrics.slice(-1000);
    }

    // Log the usage (in production, you'd want to use a proper logging service)
    console.log(`LLM Usage: ${metrics.provider} (${metrics.model}) - ${metrics.tokensUsed} tokens - $${metrics.costEstimate.toFixed(4)} - ${metrics.responseTimeMs}ms - ${metrics.success ? 'SUCCESS' : 'FAILED'}`);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    providerBreakdown: { [provider: string]: { requests: number; tokens: number; cost: number } };
  } {
    const stats = {
      totalRequests: this.usageMetrics.length,
      successfulRequests: this.usageMetrics.filter(m => m.success).length,
      totalTokens: this.usageMetrics.reduce((sum, m) => sum + m.tokensUsed, 0),
      totalCost: this.usageMetrics.reduce((sum, m) => sum + m.costEstimate, 0),
      averageResponseTime: this.usageMetrics.length > 0 
        ? this.usageMetrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / this.usageMetrics.length 
        : 0,
      providerBreakdown: {} as { [provider: string]: { requests: number; tokens: number; cost: number } },
    };

    // Calculate provider breakdown
    this.usageMetrics.forEach(metric => {
      if (!stats.providerBreakdown[metric.provider]) {
        stats.providerBreakdown[metric.provider] = { requests: 0, tokens: 0, cost: 0 };
      }
      stats.providerBreakdown[metric.provider].requests++;
      stats.providerBreakdown[metric.provider].tokens += metric.tokensUsed;
      stats.providerBreakdown[metric.provider].cost += metric.costEstimate;
    });

    return stats;
  }

  /**
   * Test all providers to ensure they're working correctly
   */
  async testProviders(): Promise<{ [provider: string]: { available: boolean; error?: string } }> {
    const results: { [provider: string]: { available: boolean; error?: string } } = {};
    
    for (const [name, provider] of this.providers) {
      try {
        // Simple test prompt
        await provider.generate('Test prompt: say "hello"', { maxTokens: 10 });
        results[name] = { available: true };
      } catch (error: any) {
        results[name] = { available: false, error: error.message };
      }
    }

    return results;
  }
}

// Singleton instance
export const llmService = new LLMService(); 