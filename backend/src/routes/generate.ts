import { Router } from 'express';
import * as generateController from '../controllers/generateController';

const router = Router();

// Character generation
router.post('/character', generateController.generateCharacter);

// Provider management
router.get('/providers', generateController.getProviders);
router.get('/usage-stats', generateController.getUsageStats);
router.get('/test-providers', generateController.testProviders);

export default router; 