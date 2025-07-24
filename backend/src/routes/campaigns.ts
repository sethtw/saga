import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';

const router = Router();

router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.get('/:campaignId/elements', campaignController.getMapElements);
router.post('/:campaignId/elements', campaignController.syncMapElements);
router.post('/:campaignId/sync', campaignController.syncMapChanges);

export default router; 