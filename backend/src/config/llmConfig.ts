export interface LLMProviderConfig {
  model: string;
  maxTokens: number;
  temperature?: number;
  enabled: boolean;
  costPer1kTokens?: number; // For cost tracking
}

export interface LLMConfig {
  defaultProvider: string;
  providers: {
    [key: string]: LLMProviderConfig;
  };
  globalMaxTokens: number;
  timeoutMs: number;
}

export const llmConfig: LLMConfig = {
  defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'gemini',
  globalMaxTokens: 4096,
  timeoutMs: 30000, // 30 seconds timeout
  providers: {
    gemini: {
      model: 'gemini-1.5-flash', // Fast and cost-effective
      maxTokens: 2048,
      temperature: 0.7,
      enabled: process.env.ENABLE_GEMINI === 'true',
      costPer1kTokens: 0.075, // Approximate cost in USD
    },
    openai: {
      model: 'gpt-4o-mini', // New cheaper GPT-4 model
      maxTokens: 2048,
      temperature: 0.7,
      enabled: process.env.ENABLE_OPENAI === 'true',
      costPer1kTokens: 0.15, // Approximate cost in USD
    },
    claude: {
      model: 'claude-3-haiku-20240307', // Cheapest Claude 3 model
      maxTokens: 2048,
      temperature: 0.7,
      enabled: process.env.ENABLE_CLAUDE === 'true',
      costPer1kTokens: 0.25, // Approximate cost in USD
    },
    groq: {
      model: 'llama3-8b-8192', // Free tier available
      maxTokens: 2048,
      temperature: 0.7,
      enabled: process.env.ENABLE_GROQ === 'true',
      costPer1kTokens: 0.0, // Free tier
    },
  },
};

// Get list of enabled providers
export const getEnabledProviders = (): string[] => {
  return Object.entries(llmConfig.providers)
    .filter(([_, config]) => config.enabled)
    .map(([name, _]) => name);
};

// Get provider config
export const getProviderConfig = (provider: string): LLMProviderConfig | null => {
  return llmConfig.providers[provider] || null;
};

// Validate provider exists and is enabled
export const isValidProvider = (provider: string): boolean => {
  const config = getProviderConfig(provider);
  return config !== null && config.enabled;
}; 