import express from 'express';
import * as monumentController from '../controllers/monument.controller.js';
import upload from '../config/storage.js'; // This is required for the upload route

const router = express.Router();

router.get('/map-data', monumentController.getMapData);
router.get('/manuscript/:word', monumentController.getManuscriptTranslation);
router.post('/upload', upload.single('archive_file'), monumentController.uploadArchiveFile);
router.get('/', monumentController.getMonuments);
router.get('/:id', monumentController.getMonumentById);
router.get('/:id/3d-model', monumentController.get3DModelData);

export default router;