# LLM Integration - Usage Tutorial

## 🚀 Quick Start Guide

### 1. Basic Setup

```bash
# Clone and setup
cd backend
npm install
cp .env.example .env

# Add at least one API key to .env
echo "GOOGLE_API_KEY=your_key_here" >> .env
echo "ENABLE_GEMINI=true" >> .env

# Start the server
npm run dev
```

### 2. Test the System

```bash
# Check available providers
curl http://localhost:3000/api/generate/providers

# Expected response:
{
  "providers": [
    {
      "name": "gemini",
      "model": "gemini-1.5-flash",
      "available": true,
      "enabled": true
    }
  ]
}
```

## 📝 Character Generation Examples

### Example 1: Basic Tavern Character

**Request:**
```bash
curl -X POST http://localhost:3000/api/generate/character \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "friendly bartender",
    "contextId": "tavern_001",
    "campaignId": "1"
  }'
```

**Response:**
```json
{
  "id": "char_1640995200000",
  "type": "character",
  "data": {
    "name": "Gareth Brewhand",
    "description": "A portly human with a warm smile and flour-dusted apron. His eyes twinkle with mirth as he polishes mugs and shares local gossip with patrons.",
    "stats": {
      "str": 12,
      "dex": 10,
      "con": 14,
      "int": 13,
      "wis": 15,
      "cha": 16
    },
    "race": "Human",
    "class": "Commoner",
    "background": "Guild Member",
    "alignment": "Neutral Good",
    "personality": "Cheerful and talkative, always ready with a joke or local news",
    "equipment": ["Bar Rag", "Wooden Mug", "Bottle of Fine Wine", "Coin Purse"]
  },
  "llmMetadata": {
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "tokensUsed": 287,
    "costEstimate": 0.0215,
    "responseTimeMs": 1340
  }
}
```

### Example 2: Specific Provider Selection

```bash
curl -X POST http://localhost:3000/api/generate/character \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "mysterious hooded figure",
    "contextId": "alley_dark_001",
    "campaignId": "1",
    "provider": "claude"
  }'
```

### Example 3: Complex Context (Multi-level Hierarchy)

**Database Setup:**
- Campaign: "Shadows of Eldoria" 
- Region: "The Whispering Woods" (dark forest)
- City: "Ravenshollow" (gloomy mountain town)
- Area: "The Crooked Cauldron" (shady tavern)

**Request:**
```bash
curl -X POST http://localhost:3000/api/generate/character \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "information broker",
    "contextId": "crooked_cauldron_001",
    "campaignId": "2"
  }'
```

**Expected Result:**
The LLM will generate a character that fits the dark, mysterious setting - perhaps a shadowy figure who deals in secrets and whispers, perfectly suited to the gloomy tavern in a dark forest town.

## 🔧 Configuration Examples

### Scenario 1: Cost-Conscious Setup (Free Tier Only)

```bash
# .env configuration
GROQ_API_KEY=your_groq_key
ENABLE_GROQ=true
ENABLE_GEMINI=false
ENABLE_OPENAI=false
ENABLE_CLAUDE=false
DEFAULT_LLM_PROVIDER=groq
```

**Benefits:**
- $0 cost for testing and development
- Ultra-fast response times (~800ms)
- Good quality for most use cases

### Scenario 2: Balanced Production Setup

```bash
# .env configuration
GOOGLE_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key
ENABLE_GEMINI=true
ENABLE_GROQ=true
ENABLE_OPENAI=false
ENABLE_CLAUDE=false
DEFAULT_LLM_PROVIDER=gemini
```

**Benefits:**
- Low cost with Gemini as primary ($0.075/1k tokens)
- Groq as free fallback for high-volume scenarios
- Good balance of cost, speed, and quality

### Scenario 3: Premium Quality Setup

```bash
# .env configuration
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
ENABLE_CLAUDE=true
ENABLE_OPENAI=true
ENABLE_GEMINI=true
DEFAULT_LLM_PROVIDER=claude
```

**Benefits:**
- Highest quality character generation
- Multiple fallback options
- Good for premium campaigns or paid services

## 🏛️ Context Customization Examples

### Adding Custom Context Types

**1. Extend the Context Interface:**

```typescript
// In src/services/promptService.ts
export interface PromptContext {
  CAMPAIGN_NAME?: string;
  CAMPAIGN_DESCRIPTION?: string;
  CLIMATE?: string;           // New: Weather/climate info
  SEASON?: string;           // New: Current season
  TIME_OF_DAY?: string;      // New: Time context
  POLITICAL_TENSION?: string; // New: Political climate
  // ... existing fields
}
```

**2. Update Context Builder:**

```typescript
// In src/services/generateService.ts
async function buildContextFromDatabase(contextId: string, campaignId: string): Promise<PromptContext> {
  const context: PromptContext = { USER_PROMPT: '' };
  
  // ... existing logic ...
  
  // Add custom context
  context.CLIMATE = await getClimateForRegion(contextId);
  context.SEASON = await getCurrentSeason(campaignId);
  context.TIME_OF_DAY = await getTimeOfDay(contextId);
  
  return context;
}
```

**3. Update Prompt Template:**

```handlebars
<!-- In src/prompts/character_generation.txt -->
{{#if CLIMATE}}
Climate: {{CLIMATE}}
{{/if}}

{{#if SEASON}}
Season: {{SEASON}}
{{/if}}

{{#if TIME_OF_DAY}}
Time: {{TIME_OF_DAY}}
{{/if}}
```

### Campaign-Specific Context Processors

```typescript
// src/services/contextProcessors/fantasyProcessor.ts
export class FantasyContextProcessor {
  static async process(context: PromptContext, element: any): Promise<PromptContext> {
    // Add fantasy-specific enhancements
    if (context.AREA_TYPE === 'tavern') {
      context.AREA_DESCRIPTION += ' The hearth crackles warmly, and the scent of roasted meat fills the air.';
    }
    
    if (context.CITY_NAME?.includes('port')) {
      context.TRADE_GOODS = 'exotic spices, fine silks, rare gems';
    }
    
    return context;
  }
}

// Usage in generateService.ts
const context = await buildContextFromDatabase(contextId, campaignId);
const enhancedContext = await FantasyContextProcessor.process(context, targetElement);
```

### Modular Context Assembly

```typescript
// src/services/contextModules/weatherModule.ts
export class WeatherContextModule implements ContextModule {
  name = 'weather';
  
  async process(context: PromptContext, element: any): Promise<PromptContext> {
    const weather = await this.getWeatherForLocation(element);
    context.WEATHER = weather.description;
    context.TEMPERATURE = weather.temperature;
    
    // Adjust character suggestions based on weather
    if (weather.type === 'storm') {
      context.SUGGESTED_MOOD = 'tense, hurried';
    } else if (weather.type === 'sunny') {
      context.SUGGESTED_MOOD = 'cheerful, relaxed';
    }
    
    return context;
  }
}
```

## 📊 Monitoring and Analytics

### Check System Health

```bash
# Test all providers
curl http://localhost:3000/api/generate/test-providers

# Response shows which providers are working:
{
  "results": {
    "gemini": { "available": true },
    "openai": { "available": false, "error": "Invalid API key" },
    "claude": { "available": true },
    "groq": { "available": true }
  }
}
```

### Monitor Usage and Costs

```bash
# Get usage statistics
curl http://localhost:3000/api/generate/usage-stats

# Response includes cost breakdown:
{
  "totalRequests": 156,
  "successfulRequests": 152,
  "totalTokens": 47823,
  "totalCost": 3.587,
  "averageResponseTime": 1456,
  "providerBreakdown": {
    "gemini": { "requests": 89, "tokens": 27234, "cost": 2.043 },
    "claude": { "requests": 34, "tokens": 12456, "cost": 3.114 },
    "groq": { "requests": 33, "tokens": 8133, "cost": 0.0 }
  }
}
```

## 🐛 Troubleshooting Common Issues

### Issue 1: "No LLM providers are available"

**Cause:** No API keys configured or all providers disabled

**Solution:**
```bash
# Check your .env file
cat .env | grep API_KEY

# Ensure at least one provider is enabled
echo "ENABLE_GEMINI=true" >> .env

# Restart the server
npm run dev
```

### Issue 2: "Invalid JSON response"

**Cause:** LLM returned malformed JSON

**Solution:** The system includes automatic retry with fallback providers. Check logs for details:

```bash
# Check server logs for validation errors
tail -f logs/server.log | grep "Invalid JSON"
```

### Issue 3: High costs

**Solution:** Switch to more cost-effective providers:

```bash
# Use Groq (free) as default
echo "DEFAULT_LLM_PROVIDER=groq" >> .env

# Or limit token usage
echo "MAX_TOKENS=1024" >> .env  # Reduces cost by ~50%
```

### Issue 4: Slow response times

**Solution:**
```bash
# Use Groq for speed (800ms average)
echo "DEFAULT_LLM_PROVIDER=groq" >> .env

# Or reduce max tokens for faster processing
echo "MAX_TOKENS=1024" >> .env
```

## 🧪 Testing Different Scenarios

### Test 1: Medieval Fantasy Setting

```bash
curl -X POST http://localhost:3000/api/generate/character \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "village blacksmith",
    "contextId": "medieval_village_forge",
    "campaignId": "1",
    "provider": "gemini"
  }'
```

### Test 2: Modern Urban Setting

```bash
curl -X POST http://localhost:3000/api/generate/character \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "coffee shop barista",
    "contextId": "downtown_cafe",
    "campaignId": "2",
    "provider": "claude"
  }'
```

### Test 3: Sci-Fi Space Station

```bash
curl -X POST http://localhost:3000/api/generate/character \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "maintenance technician",
    "contextId": "space_station_engineering",
    "campaignId": "3",
    "provider": "openai"
  }'
```

## 🎯 Best Practices

### 1. Provider Selection Strategy

- **Development/Testing**: Use Groq (free, fast)
- **Production (Budget)**: Use Gemini (cheap, good quality)
- **Production (Premium)**: Use Claude (expensive, best quality)
- **Fallback**: Always enable Groq as backup

### 2. Cost Optimization

```typescript
// Adjust parameters based on character importance
const generateOptions = {
  provider: isMainCharacter ? 'claude' : 'groq',
  maxTokens: isMainCharacter ? 2048 : 1024,
  temperature: needsCreativity ? 0.8 : 0.5
};
```

### 3. Context Optimization

- Keep area descriptions concise but descriptive
- Use hierarchical structure (campaign → region → city → area)
- Include mood and atmosphere information
- Specify the type of establishment or location

### 4. Error Handling

```typescript
// Always handle errors gracefully
try {
  const character = await generateCharacter(prompt, contextId, campaignId);
  return character;
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Wait and retry with different provider
    await delay(1000);
    return generateCharacter(prompt, contextId, campaignId, 'groq');
  }
  throw error;
}
```

## 🚀 Production Deployment Checklist

### Pre-deployment
- [ ] All API keys configured in production environment
- [ ] Default provider set to cost-effective option (Gemini)
- [ ] Groq enabled as free fallback
- [ ] Monitoring and logging configured
- [ ] Rate limiting implemented

### Post-deployment
- [ ] Monitor initial usage and costs
- [ ] Test all providers in production
- [ ] Verify fallback mechanisms
- [ ] Set up usage alerts
- [ ] Document any custom configurations

---

**Next Steps**: Ready to integrate with the frontend! See the main README for architecture details and the implementation review for a complete assessment. 