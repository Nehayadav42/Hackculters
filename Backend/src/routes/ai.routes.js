import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import * as ocrController from '../controllers/ocr.controller.js';
import { createDocumentUpload } from '../config/documentUpload.js';

const router = express.Router();
const ocrUpload = createDocumentUpload("document", [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".txt",
    ".docx",
]);

// Existing AI endpoints
router.post('/summarize', aiController.summarizeDocument);
router.post('/chat', aiController.chatWithAssistant);

// New OCR Endpoints
router.post('/ocr', ocrUpload, ocrController.processOcrDocument);
router.get('/ocr/:id', ocrController.getDocumentOcrById);

export default router;