
import express from 'express';
import * as monumentController from '../controllers/monument.controller.js';
import upload from '../config/storage.js';

const router = express.Router();

// Static routes first
router.get('/map-data', monumentController.getMapData);
router.get('/search/all', monumentController.searchArchives);
router.get('/manuscript/:word', monumentController.getManuscriptTranslation);

// Upload
router.post(
    '/upload',
    upload.single('archive_file'),
    monumentController.uploadArchiveFile
);

// General monument routes
router.get('/', monumentController.getMonuments);
router.get('/:id/3d-model', monumentController.get3DModelData);
router.get('/:id', monumentController.getMonumentById);

export default router;
