import { Router } from 'express';
import * as elementController from '../controllers/elementController';

const router = Router();

router.post('/', elementController.createElement);
router.put('/:elementId', elementController.updateElement);
router.delete('/:elementId', elementController.deleteElement);

export default router; 