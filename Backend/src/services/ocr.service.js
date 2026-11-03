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

export const processUploadedDocumentViaAI = async ({
    fileUrl,
    originalName,
    fileType,
    sourceLanguage,
    targetLanguage,
    documentType
}) => {
    let parsedUrl;

    try {
        parsedUrl = new URL(fileUrl);
    } catch {
        throw new Error("The uploaded file URL is invalid.");
    }

    if (
        parsedUrl.protocol !== "https:" ||
        parsedUrl.hostname !== "res.cloudinary.com"
    ) {
        throw new Error("The uploaded file is not available from Cloudinary.");
    }

    const response = await fetch(parsedUrl, {
        signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
        throw new Error(`Unable to retrieve the uploaded file (HTTP ${response.status}).`);
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());

    return processDocumentViaAI(
        fileBuffer,
        originalName,
        fileType,
        sourceLanguage,
        targetLanguage,
        documentType
    );
};