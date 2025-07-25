import { Router } from 'express';
import * as generateController from '../controllers/generateController';

const router = Router();

// Legacy character generation (backward compatibility)
router.post('/character', generateController.generateCharacter);

// Enhanced character generation using generic system
router.post('/character/generic', generateController.generateCharacterGeneric);

// Generic object generation routes
router.post('/object/:objectType', generateController.generateObject);

// Object type discovery routes
router.get('/object-types', generateController.getObjectTypes);
router.get('/object-types/:objectType', generateController.getObjectTypeDefinition);

// LLM provider routes (existing)
router.get('/providers', async (req, res) => {
  try {
    const { llmService } = await import('../services/llm/llmService');
    const providers = llmService.getAvailableProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
});

router.get('/usage-stats', async (req, res) => {
  try {
    const { llmService } = await import('../services/llm/llmService');
    const stats = llmService.getUsageStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

router.post('/test-providers', async (req, res) => {
  try {
    const { llmService } = await import('../services/llm/llmService');
    const results = await llmService.testProviders();
    res.json(results);
  } catch (error) {
    console.error('Error testing providers:', error);
    res.status(500).json({ error: 'Failed to test providers' });
  }
});

export default router; 