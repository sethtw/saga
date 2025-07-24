import { Router } from 'express';
import * as generateController from '../controllers/generateController';

const router = Router();

router.post('/character', generateController.generateCharacter);

export default router; 