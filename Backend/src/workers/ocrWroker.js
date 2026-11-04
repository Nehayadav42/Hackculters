import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import axios from 'axios';
import FormData from 'form-data';
import { supabase } from '../config/supabaseClient.js';

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null 
});

export const ocrQueue = new Queue('ocr-processing', { connection });

const ocrWorker = new Worker('ocr-processing', async job => {
  const { documentId, fileUrl, sourceLang = 'hi', targetLang = 'en', docType = 'auto' } = job.data;
  console.log(`[Worker] Starting real AI pipeline for document: ${documentId}`);
  
  try {
    // 1. Download the uploaded file from the Cloudinary URL
    console.log(`[Worker] Fetching file from Cloudinary...`);
    const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(fileResponse.data, 'binary');
    
    // Extract filename from URL (or fallback)
    const filename = fileUrl.split('/').pop() || 'document.jpg';

    // 2. Prepare the form data exactly as FastAPI expects it
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename });
    formData.append('source_language', sourceLang);
    formData.append('output_language', targetLang);
    formData.append('document_type', docType);

    // 3. Send to your Python FastAPI Microservice
    console.log(`[Worker] Sending to Python Microservice on port 8000...`);
    const aiResponse = await axios.post('http://127.0.0.1:8000/process-document', formData, {
      headers: { ...formData.getHeaders() },
    });

    const { original_text, translated_text, romanized_text } = aiResponse.data;

    // 4. Update the Supabase database with the REAL AI extracted text
    const { error } = await supabase
      .from('documents')
      .update({ 
        extracted_text: original_text,
        translated_text: translated_text,
        romanized_text: romanized_text,
        status: 'completed' // Mark as done if you track status
      })
      .eq('id', documentId);

    if (error) throw new Error(error.message);
    
    console.log(`[Worker] Finished OCR! Real text saved to database for ${documentId}.`);
    return { success: true };
    
  } catch (error) {
    console.error(`[Worker Error for ${documentId}]:`, error.message);
    
    // Optional: Update document status to 'failed' in DB
    await supabase.from('documents').update({ status: 'failed' }).eq('id', documentId);
    
    throw error;
  }
}, { connection });