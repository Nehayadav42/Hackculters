import { supabase } from '../config/supabaseClient.js';
import { processDocumentViaAI } from '../services/ocr.service.js';

export const processOcrDocument = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

        const { site_id, title, source_language, output_language, document_type } = req.body;
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;

        // 1. Upload to Supabase Storage
        const storagePath = `archives/${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
        await supabase.storage.from('cultural-archives').upload(storagePath, fileBuffer, { contentType: req.file.mimetype });
        const { data: publicUrlData } = supabase.storage.from('cultural-archives').getPublicUrl(storagePath);

        // 2. Call Python Microservice
        const aiResult = await processDocumentViaAI(
            fileBuffer, originalName, req.file.mimetype, 
            source_language, output_language, document_type
        );

        // 3. Save to Database (using your existing translated_text and translated_language columns)
        const { data: documentRecord, error: dbError } = await supabase
            .from('documents')
            .insert([{
                site_id: site_id || null,
                title: title || originalName,
                document_type: req.file.mimetype.includes('image') ? 'Image' : 'Document',
                file_path: publicUrlData.publicUrl,
                original_file_name: originalName,
                language: aiResult.detected_source_language,
                ocr_text: aiResult.original_text,
                translated_text: aiResult.translated_text,
                translated_language: aiResult.target_language,
                ocr_engine: aiResult.ocr_engine,
                confidence_score: aiResult.ocr_confidence,
                status: 'completed'
            }])
            .select().single();

        if (dbError) throw new Error(dbError.message);

        res.status(201).json({ success: true, data: documentRecord, ai_metadata: aiResult });
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