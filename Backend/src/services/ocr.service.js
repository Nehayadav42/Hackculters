import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import axios from 'axios';
import FormData from 'form-data';

const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/process-image';

export const extractDocumentText = async (fileBuffer, fileType, originalName, targetLanguage = 'hindi') => {
    const mimeType = fileType.toLowerCase();

    // 1. Plain Text Files
    if (mimeType.includes('text/plain') || originalName.endsWith('.txt')) {
        const text = fileBuffer.toString('utf8');
        return {
            extracted_text: text,
            page_wise_text: [{ page: 1, text }],
            ocr_engine: 'native-txt-parser',
            confidence_score: 1.0,
            language: targetLanguage
        };
    }

    // 2. DOCX Word Documents
    if (mimeType.includes('wordprocessingml') || originalName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return {
            extracted_text: result.value,
            page_wise_text: [{ page: 1, text: result.value }],
            ocr_engine: 'mammoth-docx-parser',
            confidence_score: 1.0,
            language: targetLanguage
        };
    }

    // 3. Digital PDFs (Extract embedded text)
    if (mimeType.includes('pdf') || originalName.endsWith('.pdf')) {
        const pdfData = await pdf(fileBuffer);
        
        // If digital text exists, return it directly
        if (pdfData.text && pdfData.text.trim().length > 50) {
            return {
                extracted_text: pdfData.text,
                page_wise_text: [{ page: 1, text: pdfData.text }],
                ocr_engine: 'pdf-parse-digital',
                confidence_score: 0.98,
                language: targetLanguage
            };
        }
        // Scanned PDFs fallback to image-based pipeline via Python microservice
    }

    // 4. Images (JPG, PNG) or Scanned PDFs: Route to Python OpenCV + Indic OCR Microservice
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: originalName, contentType: fileType });
    formData.append('language', targetLanguage);

    const response = await axios.post(PYTHON_OCR_URL, formData, {
        headers: formData.getHeaders(),
        timeout: 60000 // 60-second timeout for image processing
    });

    if (!response.data || !response.data.success) {
        throw new Error("Failed to extract text from Python OCR microservice");
    }

    const ocrResult = response.data.data;
    return {
        extracted_text: ocrResult.extracted_text,
        page_wise_text: [{ page: 1, text: ocrResult.extracted_text }],
        ocr_engine: ocrResult.ocr_engine,
        confidence_score: ocrResult.confidence_score,
        language: ocrResult.language
    };
};