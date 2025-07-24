# Saga Backend - LLM Integration System

A production-ready, multi-provider LLM integration system for TTRPG character generation with comprehensive cost management, error handling, and modular architecture.

## 🚀 Features

- **Multi-Provider Support**: Seamlessly switch between Gemini, OpenAI, Claude, and Groq
- **Cost Management**: Real-time token counting and cost estimation per request
- **Intelligent Fallbacks**: Automatic provider selection when preferred option fails
- **Rich Context Assembly**: Hierarchical campaign → region → city → area context building
- **Schema Validation**: Strict zod validation ensures consistent character data structure
- **Comprehensive Error Handling**: Specific error codes for auth, rate limits, safety filters
- **Usage Analytics**: Built-in tracking for monitoring and cost analysis

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# GOOGLE_API_KEY=your_google_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GROQ_API_KEY=your_groq_api_key_here
```

## 🏗️ Architecture

### Provider-Based Strategy Pattern

```
LLMService (Factory)
├── GeminiProvider (Google Gemini 1.5 Flash)
├── OpenAIProvider (GPT-4o-mini)
├── ClaudeProvider (Claude 3 Haiku)
└── GroqProvider (Llama 3 - Free Tier)
```

### File Structure

```
src/
├── config/
│   └── llmConfig.ts              # Provider configurations & settings
├── services/
│   ├── llm/
│   │   ├── types.ts              # Core interfaces & error types
│   │   ├── schemas.ts            # Zod validation schemas
│   │   ├── llmService.ts         # Factory & service manager
│   │   └── providers/
│   │       ├── gemini.ts         # Google Gemini implementation
│   │       ├── openai.ts         # OpenAI GPT implementation
│   │       ├── claude.ts         # Anthropic Claude implementation
│   │       └── groq.ts           # Groq Llama implementation
│   ├── promptService.ts          # Template engine
│   └── generateService.ts        # Character generation service
├── prompts/
│   └── character_generation.txt  # Rich character prompt template
└── controllers/
    └── generateController.ts     # REST API endpoints
```

## 🎯 API Endpoints

### Character Generation

```http
POST /api/generate/character
Content-Type: application/json

{
  "prompt": "orc blacksmith",
  "contextId": "room_123",
  "campaignId": "1",
  "provider": "gemini" // optional
}
```

**Response:**
```json
{
  "id": "char_1234567890",
  "type": "character",
  "data": {
    "name": "Grimjaw Ironforge",
    "description": "A burly orc with calloused hands...",
    "stats": { "str": 16, "dex": 10, "con": 14, "int": 12, "wis": 8, "cha": 6 },
    "race": "Orc",
    "class": "Blacksmith",
    "background": "Guild Artisan",
    "alignment": "Lawful Neutral",
    "personality": "Gruff but honest, takes pride in his work",
    "equipment": ["Heavy Hammer", "Leather Apron", "Tongs"]
  },
  "llmMetadata": {
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "tokensUsed": 312,
    "costEstimate": 0.0234,
    "responseTimeMs": 1247
  }
}
```

### Provider Management

```http
GET /api/generate/providers
```

**Response:**
```json
{
  "providers": [
    {
      "name": "gemini",
      "model": "gemini-1.5-flash",
      "available": true,
      "enabled": true
    },
    {
      "name": "openai",
      "model": "gpt-4o-mini",
      "available": false,
      "enabled": true
    }
  ]
}
```

### Usage Statistics

```http
GET /api/generate/usage-stats
```

**Response:**
```json
{
  "totalRequests": 42,
  "successfulRequests": 40,
  "totalTokens": 12450,
  "totalCost": 0.934,
  "averageResponseTime": 1340,
  "providerBreakdown": {
    "gemini": { "requests": 25, "tokens": 7800, "cost": 0.585 },
    "openai": { "requests": 15, "tokens": 4650, "cost": 0.349 }
  }
}
```

## 🔧 Configuration

### Provider Configuration (`src/config/llmConfig.ts`)

```typescript
export const llmConfig: LLMConfig = {
  defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'gemini',
  globalMaxTokens: 4096,
  timeoutMs: 30000,
  providers: {
    gemini: {
      model: 'gemini-1.5-flash',
      maxTokens: 2048,
      temperature: 0.7,
      enabled: process.env.ENABLE_GEMINI === 'true',
      costPer1kTokens: 0.075, // USD
    },
    openai: {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
      enabled: process.env.ENABLE_OPENAI === 'true',
      costPer1kTokens: 0.15,
    },
    // ... other providers
  },
};
```

### Environment Variables

```bash
# API Keys
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Provider Settings
DEFAULT_LLM_PROVIDER=gemini
ENABLE_GEMINI=true
ENABLE_OPENAI=true
ENABLE_CLAUDE=true
ENABLE_GROQ=true
```

## 🏛️ Rich Context Assembly - Hierarchical System

### Overview

The system builds rich context by traversing the database hierarchy: Campaign → Region → City → Area → Character. This provides LLMs with comprehensive background for generating contextually appropriate characters.

### Context Flow Diagram

```
Database Hierarchy:
Campaign (id: 1, name: "The Cursed Realm")
└── Region (parentId: null, name: "Shadowlands")
    └── City (parentId: region_id, name: "Grimhaven")
        └── Area (parentId: city_id, name: "The Rusty Anvil Tavern")
            └── [Generated Character] ← Target location
```

### Implementation Details

The `buildContextFromDatabase()` function in `generateService.ts` performs the hierarchical traversal:

```typescript
async function buildContextFromDatabase(contextId: string, campaignId: string): Promise<PromptContext> {
  const context: PromptContext = { USER_PROMPT: '' };

  // 1. Get campaign info
  const campaign = await prisma.campaign.findUnique({
    where: { id: parseInt(campaignId, 10) }
  });
  if (campaign) {
    context.CAMPAIGN_NAME = campaign.name;
    context.CAMPAIGN_DESCRIPTION = campaign.description;
  }

  // 2. Get target element (room/area where character will be placed)
  const targetElement = await prisma.mapElement.findUnique({
    where: { id: contextId }
  });
  if (targetElement?.data) {
    const elementData = targetElement.data as any;
    context.AREA_NAME = elementData.label || elementData.name;
    context.AREA_DESCRIPTION = elementData.description;
    context.AREA_TYPE = targetElement.type;
  }

  // 3. Walk up the hierarchy to find parent context
  let currentElement = targetElement;
  while (currentElement?.parentElementId) {
    const parentElement = await prisma.mapElement.findUnique({
      where: { id: currentElement.parentElementId }
    });

    if (parentElement?.data) {
      const parentData = parentElement.data as any;
      
      // Categorize parent based on type
      if (parentElement.type === 'city' || parentElement.type === 'settlement') {
        context.CITY_NAME = parentData.label || parentData.name;
        context.CITY_DESCRIPTION = parentData.description;
      } else if (parentElement.type === 'region' || parentElement.type === 'area') {
        context.REGION_NAME = parentData.label || parentData.name;
        context.REGION_DESCRIPTION = parentData.description;
      }
    }
    currentElement = parentElement;
  }

  return context;
}
```

### Customizing Context Assembly

#### Adding New Context Types

To add support for new element types (e.g., `kingdom`, `plane`):

1. **Update the PromptContext interface** in `src/services/promptService.ts`:

```typescript
export interface PromptContext {
  CAMPAIGN_NAME?: string;
  CAMPAIGN_DESCRIPTION?: string;
  KINGDOM_NAME?: string;        // New field
  KINGDOM_DESCRIPTION?: string; // New field
  REGION_NAME?: string;
  // ... existing fields
}
```

2. **Extend the context builder** in `generateService.ts`:

```typescript
// Add to the parent categorization logic
if (parentElement.type === 'kingdom') {
  context.KINGDOM_NAME = parentData.label || parentData.name;
  context.KINGDOM_DESCRIPTION = parentData.description;
} else if (parentElement.type === 'city' || parentElement.type === 'settlement') {
  // ... existing logic
}
```

3. **Update the prompt template** in `src/prompts/character_generation.txt`:

```handlebars
{{#if KINGDOM_NAME}}
Kingdom: {{KINGDOM_NAME}}
Kingdom Description: {{KINGDOM_DESCRIPTION}}
{{/if}}
```

#### Custom Context Processors

Create specialized context processors for different campaign types:

```typescript
// src/services/contextProcessors.ts
export class ContextProcessor {
  static async buildFantasyContext(contextId: string, campaignId: string): Promise<PromptContext> {
    // Fantasy-specific context building logic
    const context = await buildContextFromDatabase(contextId, campaignId);
    
    // Add fantasy-specific enhancements
    if (context.AREA_TYPE === 'tavern') {
      context.AREA_DESCRIPTION += ' The air is thick with pipe smoke and ale.';
    }
    
    return context;
  }

  static async buildSciFiContext(contextId: string, campaignId: string): Promise<PromptContext> {
    // Sci-fi specific context building
    const context = await buildContextFromDatabase(contextId, campaignId);
    
    // Convert fantasy terms to sci-fi equivalents
    if (context.CITY_NAME) {
      context.CITY_NAME = context.CITY_NAME.replace('town', 'station');
    }
    
    return context;
  }
}
```

#### Modular Context Assembly

For complex campaigns, implement modular context assembly:

```typescript
// src/services/contextModules.ts
export interface ContextModule {
  name: string;
  process(context: PromptContext, element: any): Promise<PromptContext>;
}

export class PoliticalContextModule implements ContextModule {
  name = 'political';
  
  async process(context: PromptContext, element: any): Promise<PromptContext> {
    // Add political context (ruling factions, conflicts, etc.)
    const politicalData = await this.getPoliticalData(element);
    context.POLITICAL_CLIMATE = politicalData.climate;
    context.RULING_FACTION = politicalData.ruler;
    return context;
  }
}

export class EconomicContextModule implements ContextModule {
  name = 'economic';
  
  async process(context: PromptContext, element: any): Promise<PromptContext> {
    // Add economic context (trade routes, wealth level, etc.)
    const economicData = await this.getEconomicData(element);
    context.WEALTH_LEVEL = economicData.wealthLevel;
    context.TRADE_GOODS = economicData.primaryTrade;
    return context;
  }
}

// Usage in generateService.ts
const contextModules = [
  new PoliticalContextModule(),
  new EconomicContextModule()
];

async function buildEnhancedContext(contextId: string, campaignId: string): Promise<PromptContext> {
  let context = await buildContextFromDatabase(contextId, campaignId);
  
  const targetElement = await prisma.mapElement.findUnique({
    where: { id: contextId }
  });
  
  // Apply all context modules
  for (const module of contextModules) {
    context = await module.process(context, targetElement);
  }
  
  return context;
}
```

### Context Assembly Examples

#### Example 1: Tavern in a Fantasy City

**Database Structure:**
- Campaign: "The Shattered Crown" (war-torn realm)
- Region: "The Borderlands" (contested territory)
- City: "Millhaven" (fortified trading post)
- Area: "The Prancing Pony" (tavern)

**Generated Context:**
```typescript
{
  CAMPAIGN_NAME: "The Shattered Crown",
  CAMPAIGN_DESCRIPTION: "A war-torn realm where ancient bloodlines clash for the throne",
  REGION_NAME: "The Borderlands",
  REGION_DESCRIPTION: "Contested territory between warring kingdoms, full of refugees and mercenaries",
  CITY_NAME: "Millhaven",
  CITY_DESCRIPTION: "A fortified trading post with high walls and suspicious guards",
  AREA_NAME: "The Prancing Pony",
  AREA_DESCRIPTION: "A dimly lit tavern frequented by travelers and sellswords",
  AREA_TYPE: "tavern",
  USER_PROMPT: "nervous merchant"
}
```

**Result:** The LLM will generate a nervous merchant that fits the war-torn, dangerous setting - perhaps a refugee trader or someone dealing in black market goods.

#### Example 2: Space Station in Sci-Fi Campaign

**Database Structure:**
- Campaign: "Stars of Steel" (space opera)
- Region: "Outer Rim" (frontier space)
- City: "Trade Station Gamma" (space station)
- Area: "Docking Bay 7" (spaceport)

**Generated Context:**
```typescript
{
  CAMPAIGN_NAME: "Stars of Steel",
  CAMPAIGN_DESCRIPTION: "Corporate wars rage across the galaxy as mega-corporations vie for control",
  REGION_NAME: "Outer Rim",
  REGION_DESCRIPTION: "Lawless frontier space beyond corporate control",
  CITY_NAME: "Trade Station Gamma",
  CITY_DESCRIPTION: "A massive rotating station serving as a neutral trading hub",
  AREA_NAME: "Docking Bay 7",
  AREA_DESCRIPTION: "A busy spaceport with ships from across known space",
  AREA_TYPE: "spaceport",
  USER_PROMPT: "smuggler captain"
}
```

### Testing Context Assembly

```typescript
// test/contextAssembly.test.ts
describe('Context Assembly', () => {
  it('should build complete hierarchical context', async () => {
    const mockCampaign = { id: 1, name: 'Test Campaign', description: 'Test' };
    const mockRegion = { type: 'region', data: { label: 'Test Region' } };
    const mockCity = { type: 'city', data: { label: 'Test City' } };
    const mockArea = { type: 'tavern', data: { label: 'Test Tavern' } };

    // Mock database calls
    prisma.campaign.findUnique.mockResolvedValue(mockCampaign);
    // ... other mocks

    const context = await buildContextFromDatabase('area_id', '1');

    expect(context.CAMPAIGN_NAME).toBe('Test Campaign');
    expect(context.REGION_NAME).toBe('Test Region');
    expect(context.CITY_NAME).toBe('Test City');
    expect(context.AREA_NAME).toBe('Test Tavern');
  });
});
```

## 💰 Cost Management

### Real-time Cost Tracking

Every LLM request is automatically tracked with:
- Token usage (input + output)
- Cost estimation based on provider pricing
- Response time monitoring
- Success/failure rates

### Cost Optimization Strategies

1. **Provider Selection by Cost**
   ```typescript
   // Use cheapest provider for bulk generation
   const bulkProvider = 'groq'; // Free tier
   
   // Use highest quality for important characters
   const premiumProvider = 'claude'; // Best quality
   ```

2. **Token Optimization**
   ```typescript
   // Adjust max tokens based on character importance
   const options = {
     maxTokens: isMainCharacter ? 2048 : 1024,
     temperature: needsCreativity ? 0.8 : 0.5
   };
   ```

3. **Caching and Reuse**
   ```typescript
   // Cache prompt templates to avoid reprocessing
   promptService.clearCache(); // Clear in development only
   ```

## 🛡️ Error Handling

### Error Types

```typescript
// Authentication errors
if (err.code === 'AUTH_ERROR') {
  // Invalid API key
}

// Rate limiting
if (err.code === 'RATE_LIMIT') {
  // Too many requests
  const retryAfter = err.retryAfter; // seconds
}

// Content filtering
if (err.code === 'SAFETY_ERROR') {
  // Content blocked by safety filters
}

// Service unavailable
if (err.code === 'SERVICE_UNAVAILABLE') {
  // Provider temporarily down
}
```

### Fallback Strategy

```typescript
// Automatic fallback to available providers
const response = await llmService.generate(prompt, {
  provider: 'preferred_provider' // Falls back automatically if unavailable
});
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Provider Testing

```http
GET /api/generate/test-providers
```

## 📊 Monitoring & Analytics

### Built-in Metrics

- Request volume by provider
- Average response times
- Cost per request
- Success rates
- Token efficiency

### Custom Logging

```typescript
// Add custom metrics in llmService.ts
private recordUsage(metrics: LLMUsageMetrics): void {
  // Custom logging integration
  analytics.track('llm_usage', metrics);
}
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
GOOGLE_API_KEY=prod_key_here
OPENAI_API_KEY=prod_key_here

# Enable only necessary providers
ENABLE_GEMINI=true
ENABLE_OPENAI=false
ENABLE_CLAUDE=false
ENABLE_GROQ=true
```

### Performance Optimization

1. **Connection Pooling**: Configure database connection pools
2. **Caching**: Implement Redis for prompt template caching
3. **Rate Limiting**: Add request rate limiting middleware
4. **Monitoring**: Integrate with APM tools (DataDog, New Relic)

### Security

1. **API Key Rotation**: Regular rotation of LLM API keys
2. **Input Validation**: Strict validation of user prompts
3. **Output Sanitization**: Sanitize LLM responses before storage
4. **Audit Logging**: Log all generation requests for compliance

## 📝 Contributing

### Adding New Providers

1. Create provider class implementing `LLMProvider` interface
2. Add provider to `llmService.ts` initialization
3. Update configuration in `llmConfig.ts`
4. Add tests for the new provider

### Extending Prompt Templates

1. Add new template file to `src/prompts/`
2. Update `PromptService` with new template method
3. Add template variables to `PromptContext` interface

---

**Next Steps**: See [Frontend Integration Guide](../frontend/README_LLM.md) for connecting the UI to this backend system. 