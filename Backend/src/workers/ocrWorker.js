import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { supabase } from '../config/supabaseClient.js'; // Import Supabase to save the text

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null 
});

export const ocrQueue = new Queue('ocr-processing', { connection });

const ocrWorker = new Worker('ocr-processing', async job => {
    const { documentId, fileUrl } = job.data;
    console.log(`[Worker] Starting OCR for document: ${documentId}`);
    
    // Simulate a 5-second heavy AI extraction task
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const extractedText = "This is the simulated ancient text extracted by the AI pipeline.";

    // Update the document in Supabase with the extracted text
    const { error } = await supabase
        .from('documents')
        .update({ extracted_text: extractedText })
        .eq('id', documentId);

    if (error) throw new Error(error.message);
    
    console.log(`[Worker] Finished OCR! Text saved to database for ${documentId}.`);
    return { success: true };
}, { connection });