import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useLLMProviders, type LLMUsageStats } from '@/hooks/useLLMProviders';
import { toast } from 'sonner';

const LLMAnalytics: React.FC = () => {
  const {
    providers,
    loading,
    selectedProvider,
    setSelectedProvider,
    getProviderDisplayName,
    getProviderCostInfo,
    getUsageStats,
    testProviders,
    loadProviders
  } = useLLMProviders();

  const [usageStats, setUsageStats] = useState<LLMUsageStats | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    const stats = await getUsageStats();
    setUsageStats(stats);
    setLoadingStats(false);
  };

  const handleTestProviders = async () => {
    setTesting(true);
    try {
      const results = await testProviders();
      setTestResults(results);
      toast.success('Provider tests completed');
    } catch (error) {
      toast.error('Failed to test providers');
    } finally {
      setTesting(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadProviders(), loadStats()]);
    toast.success('Data refreshed');
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>LLM Analytics & Configuration</CardTitle>
            <CardDescription>
              Monitor usage, costs, and configure LLM providers for character generation
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestProviders} disabled={testing}>
              {testing ? 'Testing...' : 'Test Providers'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="providers">Provider Status</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            {loadingStats ? (
              <div className="text-center py-4">Loading usage statistics...</div>
            ) : usageStats ? (
              <div className="space-y-4">
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{usageStats.totalRequests}</div>
                      <p className="text-xs text-muted-foreground">Total Requests</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{usageStats.totalTokens.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total Tokens</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{formatCurrency(usageStats.totalCost)}</div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{Math.round(usageStats.averageResponseTime)}ms</div>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Success Rate */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-sm text-muted-foreground">
                        {usageStats.successfulRequests} / {usageStats.totalRequests}
                      </p>
                    </div>
                    <Progress 
                      value={(usageStats.successfulRequests / usageStats.totalRequests) * 100} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* Provider Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Provider Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {usageStats && usageStats.providerBreakdown ? Object.entries(usageStats.providerBreakdown).map(([provider, stats]) => (
                        <div key={provider} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{provider}</Badge>
                            <div className="text-sm">
                              <div className="font-medium">{stats.requests} requests</div>
                              <div className="text-muted-foreground">{stats.tokens.toLocaleString()} tokens</div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">{formatCurrency(stats.cost)}</div>
                            <div className="text-muted-foreground">
                              {formatCurrency(stats.cost / stats.requests || 0)}/req
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No provider breakdown data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No usage data available yet. Generate some characters to see analytics!
              </div>
            )}
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="space-y-3">
              {providers && providers.length > 0 ? providers.map((provider) => {
                const costInfo = getProviderCostInfo(provider.name);
                const testResult = testResults?.[provider.name];
                
                return (
                  <Card key={provider.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{getProviderDisplayName(provider.name)}</div>
                            <div className="text-sm text-muted-foreground">
                              {costInfo.description} • {costInfo.cost}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {testResult && (
                            <Badge variant={testResult.available ? "default" : "destructive"}>
                              {testResult.available ? "Working" : "Error"}
                            </Badge>
                          )}
                          <Badge variant={provider.available ? "default" : "secondary"}>
                            {provider.available ? "Available" : "Unavailable"}
                          </Badge>
                          <Badge variant={provider.enabled ? "default" : "outline"}>
                            {provider.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                      {testResult && !testResult.available && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {testResult.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      {loading ? 'Loading providers...' : 'No providers available. Please check your configuration.'}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default Provider</CardTitle>
                <CardDescription>
                  Choose your preferred LLM provider for character generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {providers && providers.length > 0 ? providers.filter(p => p.available && p.enabled).map((provider) => (
                    <div key={provider.name} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={provider.name}
                        name="defaultProvider"
                        checked={selectedProvider === provider.name}
                        onChange={() => setSelectedProvider(provider.name)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={provider.name} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{getProviderDisplayName(provider.name)}</span>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {getProviderCostInfo(provider.name).cost}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getProviderCostInfo(provider.name).description}
                            </Badge>
                          </div>
                        </div>
                      </label>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No available providers for selection
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Management</CardTitle>
                <CardDescription>
                  Monitor and control your LLM usage costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p><strong>Cost-Effective Strategies:</strong></p>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      <li>Use Groq (free) for development and testing</li>
                      <li>Use Gemini for production (lowest cost at $0.075/1k tokens)</li>
                      <li>Reserve Claude for premium quality when needed</li>
                      <li>Monitor token usage for cost optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LLMAnalytics; 