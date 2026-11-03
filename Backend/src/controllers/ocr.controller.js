import { supabase } from '../config/supabaseClient.js';
import { extractDocumentText } from '../services/ocr.service.js';

export const processOcrDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No document or image file provided" });
        }

        const { site_id, title, language } = req.body;
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const mimeType = req.file.mimetype;

        // 1. Upload Original File to Supabase Storage Bucket
        const storagePath = `archives/${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
        const { error: storageError } = await supabase.storage
            .from('cultural-archives')
            .upload(storagePath, fileBuffer, { contentType: mimeType });

        if (storageError) throw new Error(`Supabase Storage Error: ${storageError.message}`);

        const { data: publicUrlData } = supabase.storage
            .from('cultural-archives')
            .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;

        // 2. Perform Extraction via Service
        const extraction = await extractDocumentText(fileBuffer, mimeType, originalName, language);

        // 3. Save Record in Supabase `documents` Table
        const { data: documentRecord, error: dbError } = await supabase
            .from('documents')
            .insert([{
                site_id: site_id || null,
                title: title || originalName,
                document_type: mimeType.includes('image') ? 'Image' : 'Document',
                file_path: publicUrl,
                original_file_name: originalName,
                file_type: mimeType,
                storage_path: storagePath,
                language: extraction.language,
                ocr_text: extraction.extracted_text,
                page_wise_text: extraction.page_wise_text,
                ocr_engine: extraction.ocr_engine,
                confidence_score: extraction.confidence_score,
                status: 'completed'
            }])
            .select()
            .single();

        if (dbError) throw new Error(`Database Insert Error: ${dbError.message}`);

        res.status(201).json({
            success: true,
            message: "Document processed and stored successfully",
            data: documentRecord
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentOcrById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return res.status(404).json({ success: false, message: "Document not found" });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};