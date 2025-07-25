import { useState, useEffect } from 'react';
import { api } from '@/api/api';

export interface LLMProvider {
  name: string;
  model: string;
  available: boolean;
  enabled: boolean;
}

export interface LLMUsageStats {
  totalRequests: number;
  successfulRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  providerBreakdown: {
    [provider: string]: {
      requests: number;
      tokens: number;
      cost: number;
    };
  };
}

export const useLLMProviders = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAvailableProviders();
      // API returns array directly, not wrapped in an object
      const providersArray = Array.isArray(response) ? response : [];
      setProviders(providersArray);
      
      // Set default provider to first available one
      const availableProvider = providersArray.find((p: LLMProvider) => p.available && p.enabled);
      if (availableProvider && !selectedProvider) {
        setSelectedProvider(availableProvider.name);
      }
    } catch (err) {
      console.error('Failed to load LLM providers:', err);
      setError('Failed to load LLM providers');
      setProviders([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getUsageStats = async (): Promise<LLMUsageStats | null> => {
    try {
      const stats = await api.getUsageStats();
      return stats;
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      return null;
    }
  };

  const testProviders = async () => {
    try {
      const results = await api.testProviders();
      return results.results;
    } catch (err) {
      console.error('Failed to test providers:', err);
      return null;
    }
  };

  const getAvailableProviders = () => {
    return providers.filter(p => p.available && p.enabled);
  };

  const getProviderDisplayName = (providerName: string) => {
    const provider = providers.find(p => p.name === providerName);
    if (!provider) return providerName;
    
    const displayNames: { [key: string]: string } = {
      'gemini': `Google Gemini (${provider.model})`,
      'openai': `OpenAI (${provider.model})`,
      'claude': `Anthropic Claude (${provider.model})`,
      'groq': `Groq (${provider.model}) - Free`
    };
    
    return displayNames[providerName] || `${providerName} (${provider.model})`;
  };

  const getProviderCostInfo = (providerName: string) => {
    const costInfo: { [key: string]: { cost: string; description: string } } = {
      'gemini': { cost: '$0.075/1k tokens', description: 'Cost-effective, fast' },
      'openai': { cost: '$0.15/1k tokens', description: 'Good balance' },
      'claude': { cost: '$0.25/1k tokens', description: 'Premium quality' },
      'groq': { cost: 'Free', description: 'Ultra-fast, free tier' }
    };
    
    return costInfo[providerName] || { cost: 'Unknown', description: 'Unknown' };
  };

  return {
    providers,
    loading,
    error,
    selectedProvider,
    setSelectedProvider,
    loadProviders,
    getUsageStats,
    testProviders,
    getAvailableProviders,
    getProviderDisplayName,
    getProviderCostInfo,
  };
}; 