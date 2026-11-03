import axios from 'axios';
import FormData from 'form-data';

const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/process-document';

export const processDocumentViaAI = async (fileBuffer, originalName, fileType, sourceLang, targetLang, docType) => {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: originalName, contentType: fileType });
        formData.append('source_language', sourceLang || 'auto');
        formData.append('output_language', targetLang || 'en');
        formData.append('document_type', docType || 'auto');

        const response = await axios.post(PYTHON_OCR_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 120000 
        });

        return response.data;
    } catch (error) {
        console.error("[OCR Microservice Error]", error.message);
        if (error.code === 'ECONNREFUSED') {
            throw new Error("Python OCR Microservice is offline. Please start it on port 8000.");
        }
        // Pass through the FastAPI validation error if it exists
        throw new Error(error.response?.data?.detail || "Failed to process document in Python microservice");
    }
};