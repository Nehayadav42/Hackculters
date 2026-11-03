import express from 'express';
import multer from 'multer';
import * as aiController from '../controllers/ai.controller.js';
import * as ocrController from '../controllers/ocr.controller.js';

const router = express.Router();
const memoryStorage = multer({ storage: multer.memoryStorage() });

// Existing AI endpoints
router.post('/summarize', aiController.summarizeDocument);
router.post('/chat', aiController.chatWithAssistant);

// New OCR Endpoints
router.post('/ocr', memoryStorage.single('document'), ocrController.processOcrDocument);
router.get('/ocr/:id', ocrController.getDocumentOcrById);

export default router;