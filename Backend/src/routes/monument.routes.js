import express from 'express';
import * as monumentController from '../controllers/monument.controller.js';

const router = express.Router();

router.get('/map-data', monumentController.getMapData);
router.get('/', monumentController.getMonuments); // List view with filters
router.get('/:id', monumentController.getMonumentById); // Detail view with documents
// Add this new route for the interactive manuscript reader
router.get('/manuscript/:word', monumentController.getManuscriptTranslation);

export default router;