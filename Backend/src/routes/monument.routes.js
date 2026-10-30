import express from 'express';
import * as monumentController from '../controllers/monument.controller.js';
import upload from '../config/storage.js';

const router = express.Router();

router.get('/map-data', monumentController.getMapData);
router.get('/', monumentController.getMonuments); // List view with filters
router.get('/:id', monumentController.getMonumentById); // Detail view with documents

router.post('/upload', upload.single('archive_file'), monumentController.uploadArchiveFile);

export default router;