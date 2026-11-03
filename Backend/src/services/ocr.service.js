import axios from 'axios';
import FormData from 'form-data';

const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/process-document';

export const processDocumentViaAI = async (fileBuffer, originalName, fileType, sourceLang, targetLang, docType) => {
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: originalName, contentType: fileType });
    formData.append('source_language', sourceLang || 'auto');
    formData.append('output_language', targetLang || 'en');
    formData.append('document_type', docType || 'auto'); // 'printed' or 'handwritten'

    const response = await axios.post(PYTHON_OCR_URL, formData, {
        headers: formData.getHeaders(),
        timeout: 120000 // Extended timeout for large PDFs
    });

    if (!response.data || !response.data.success) {
        throw new Error("Failed to process document in Python microservice");
    }

    return response.data;
};