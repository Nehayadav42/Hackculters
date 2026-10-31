import express from 'express';
import * as aiController from '../controllers/ai.controller.js';

const router = express.Router();

// POST requests because the frontend needs to send us data (the question/document ID)
router.post('/summarize', aiController.summarizeDocument);
router.post('/chat', aiController.chatWithAssistant);

export default router;