# LLM Integration Strategy

This document outlines the development strategy for integrating multiple Large Language Models (LLMs) into the Saga application. The goal is to create a modular, configurable, and cost-effective system for content generation.

## 1. Core Workflow

The primary workflow remains the `POST /api/generate/character` endpoint, but it will be enhanced to support multiple providers.

1.  **Receive Request**: The backend receives `elementId`, the user's `prompt`, and an optional `provider` field.
2.  **Construct Context**: The server queries the database to get the campaign, region, city, and room context for the element.
3.  **Assemble Prompt**: A pre-defined template is loaded and populated with the context and user prompt.
4.  **Select LLM Provider**: Based on application configuration or the user's request, a specific LLM provider (e.g., Gemini, Claude) is chosen.
5.  **Call LLM**: The assembled prompt is sent to the selected LLM's API.
6.  **Process & Persist**: The response (a JSON string) is parsed, validated against a schema, and saved to the database as a new character.
7.  **Send Response**: The newly created character is returned to the frontend.

## 2. Architecture: Provider-Based Strategy

We will implement the **Strategy Pattern** to abstract the LLM providers. This makes the system modular and easy to extend.

### Architectural Diagram

```mermaid
graph TD
    subgraph Frontend
        A[GeneratorModal.tsx] -- "POST /api/generate/character\n{ prompt, elementId, provider? }" --> B(API Request)
    end

    subgraph Backend
        B --> C[generateController.ts]
        C -- "1. Receive request" --> D[generateService.ts]
        D -- "2. Assemble context (DB query)" --> E(Campaign & Room Data)
        D -- "3. Load prompt template" --> F(Prompt Template)
        D -- "4. Construct full prompt" --> G(Full Prompt)
        D -- "5. Get LLM Provider" --> H{LLMService/Factory}

        H -- "Based on config/request" --> I[GeminiProvider]
        H -- "..." --> J[ClaudeProvider]
        H -- "..." --> K[OpenAIProvider]
        H -- "..." --> L[FreeProvider]

        subgraph LLMProvider Interface
            I -- "implements" --> M(LLMProvider)
            J -- "implements" --> M
            K -- "implements" --> M
            L -- "implements" --> M
        end

        I -- "6. Call LLM API" --> N(Gemini API)
        J -- "..." --> O(Claude API)
        K -- "..." --> P(OpenAI API)
        L -- "..." --> Q(Free/Other API)

        N --> R{LLM Response (JSON String)}
        D -- "7. Process & Validate Response" --> R
        D -- "8. Persist to DB" --> S(Database)
        D -- "9. Send Response" --> T(New Character JSON)
    end

    T --> A
```

### Key Components

*   **`LLMProvider` (Interface)**: A standard interface in `backend/src/services/llm/types.ts` that all providers will implement. It will define a `generate` method.
*   **Concrete Providers**: Each LLM service (Gemini, Claude, OpenAI) will have its own class implementing the `LLMProvider` interface (e.g., `backend/src/services/llm/providers/gemini.ts`).
*   **`LLMService` (Factory)**: A service at `backend/src/services/llm/llmService.ts` that selects and instantiates the correct provider based on configuration.
*   **`generateService.ts`**: This existing service will be refactored to use the `LLMService` instead of calling a specific API directly.

## 3. Configuration Management

To manage costs and providers effectively, configuration will be centralized.

*   **.env File**: All API keys and environment-specific settings will be stored in a `.env` file at the root of the `/backend` directory. A `.env.example` file will be committed to the repository for reference.
*   **`llmConfig.ts`**: A file at `backend/src/config/llmConfig.ts` will define available models, token limits, default providers, and potentially cost-per-token data. This allows for easy adjustments without code changes.

Example `llmConfig.ts`:
```typescript
export const llmConfig = {
  defaultProvider: 'gemini',
  providers: {
    gemini: {
      model: 'gemini-1.5-flash', // Cost-effective and fast
    },
    openai: {
      model: 'gpt-4o-mini', // New, cheaper GPT-4 model
    },
    claude: {
      model: 'claude-3-haiku-20240307', // Cheapest Claude 3 model
    },
    free: {
      // Example using Groq for a free, fast option
      provider: 'groq',
      model: 'llama3-8b-8192',
    }
  },
  maxTokens: 2048,
};
```

## 4. Prompt Management

Prompt templates will be externalized to allow for easy iteration and A/B testing.

*   **`/backend/src/prompts` Directory**: Store prompt templates as text files (e.g., `character_generation.txt`).
*   **Dynamic Loading**: `generateService.ts` will load the relevant prompt file, inject the context and user request, and pass it to the LLM provider.

## 5. Development Tools & Best Practices

*   **Type Safety**: Use `zod` to define schemas for LLM outputs. This ensures the data structure is valid before attempting to save it, preventing data corruption. `zod` schemas can be automatically inferred into TypeScript types.
*   **Token Counting**: Implement token counting for each request to monitor usage and prevent unexpectedly large bills. Libraries like `tiktoken` can be used for OpenAI models.
*   **Logging**: Log which provider/model was used for each generation, along with the token count and response time. This is invaluable for debugging and cost analysis.
*   **Testing**:
    *   **Unit Tests**: Mock LLM provider calls to test the `generateService` logic (context assembly, prompt formatting).
    *   **Integration Tests**: Write tests for the full `/api/generate` endpoint, using a mocked provider to return a predictable JSON response.
*   **Frontend UI**: Add a `<Select>` component to the `GeneratorModal.tsx` to allow users to choose their desired LLM provider/model from a list fetched from the backend.

--- 