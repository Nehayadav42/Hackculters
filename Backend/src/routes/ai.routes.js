import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import * as ocrController from '../controllers/ocr.controller.js';
import upload, { requireCloudinary } from '../config/storage.js';
import { requireSupabase } from '../middlewares/requireSupabase.js';
import { requireAuthenticatedUser } from '../middlewares/requireAuthenticatedUser.js';

const router = express.Router();
router.use(requireSupabase);

// Existing AI endpoints
router.post('/summarize', requireAuthenticatedUser, aiController.summarizeDocument);
router.post('/chat', requireAuthenticatedUser, aiController.chatWithAssistant);

// New OCR Endpoints
router.post(
    '/ocr',
    requireAuthenticatedUser,
    requireCloudinary,
    upload.single('file'),
    ocrController.processOcrDocument
);
router.get(
    '/ocr/:id',
    requireAuthenticatedUser,
    ocrController.getDocumentOcrById
);

export default router;