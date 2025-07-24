import * as fs from 'fs';
import * as path from 'path';

export interface PromptContext {
  CAMPAIGN_NAME?: string;
  CAMPAIGN_DESCRIPTION?: string;
  REGION_NAME?: string;
  REGION_DESCRIPTION?: string;
  CITY_NAME?: string;
  CITY_DESCRIPTION?: string;
  AREA_NAME?: string;
  AREA_DESCRIPTION?: string;
  AREA_TYPE?: string;
  USER_PROMPT: string;
}

export class PromptService {
  private templatesPath: string;
  private templateCache: Map<string, string> = new Map();

  constructor() {
    this.templatesPath = path.join(__dirname, '../prompts');
  }

  /**
   * Load a prompt template from file
   */
  private loadTemplate(templateName: string): string {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(this.templatesPath, `${templateName}.txt`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Prompt template not found: ${templateName}`);
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    this.templateCache.set(templateName, template);
    return template;
  }

  /**
   * Simple template engine that replaces {{VARIABLE}} with context values
   * Also handles conditional blocks with {{#if VARIABLE}} and {{/if}}
   */
  private processTemplate(template: string, context: PromptContext): string {
    let processed = template;

    // Process conditional blocks first (using a more compatible regex approach)
    let match;
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    while ((match = conditionalRegex.exec(processed)) !== null) {
      const [fullMatch, variable, content] = match;
      const replacement = context[variable as keyof PromptContext] ? content : '';
      processed = processed.replace(fullMatch, replacement);
      // Reset regex lastIndex to handle multiple matches
      conditionalRegex.lastIndex = 0;
    }

    // Replace variables
    const variableRegex = /\{\{(\w+)\}\}/g;
    processed = processed.replace(variableRegex, (match, variable) => {
      const value = context[variable as keyof PromptContext];
      return value !== undefined ? String(value) : match;
    });

    // Clean up extra whitespace and newlines
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');
    processed = processed.trim();

    return processed;
  }

  /**
   * Generate a character prompt with the given context
   */
  generateCharacterPrompt(context: PromptContext): string {
    const template = this.loadTemplate('character_generation');
    return this.processTemplate(template, context);
  }

  /**
   * Get list of available prompt templates
   */
  getAvailableTemplates(): string[] {
    if (!fs.existsSync(this.templatesPath)) {
      return [];
    }

    return fs.readdirSync(this.templatesPath)
      .filter(file => file.endsWith('.txt'))
      .map(file => path.basename(file, '.txt'));
  }

  /**
   * Clear template cache (useful for development)
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}

// Singleton instance
export const promptService = new PromptService(); 