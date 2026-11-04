import { processUploadedDocumentViaAI } from "../services/ocr.service.js";

export const processOcrDocument = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

        const {
            site_id,
            title,
            source_language,
            output_language,
            document_type
        } = req.body;
        
        const originalName = req.file.originalname;
        
        // Thanks to multer-storage-cloudinary, req.file.path is ALREADY the live Cloudinary URL.
        const fileUrl = req.file.path;

        const aiResult = await processUploadedDocumentViaAI({
            fileUrl,
            originalName,
            fileType: req.file.mimetype,
            sourceLanguage: source_language || "auto",
            targetLanguage: output_language || "en",
            documentType: document_type || "auto"
        });

        const { data: documentRecord, error: dbError } = await req.supabase
            .from('documents')
            .insert([{
                site_id: site_id || null,
                title: title || originalName,
                document_type: req.file.mimetype.includes('image') ? 'Image' : 'Document',
                file_path: fileUrl, 
                original_file_name: originalName,
                language: aiResult.detected_source_language || source_language,
                ocr_text: aiResult.original_text,
                translated_text: aiResult.translated_text || null,
                translated_language: aiResult.target_language || null,
                ocr_engine: aiResult.ocr_engine,
                confidence_score: aiResult.ocr_confidence,
                status: 'completed'
            }])
            .select()
            .single();

        if (dbError) throw new Error(dbError.message);

        res.status(201).json({
            success: true,
            data: {
                ...documentRecord,
                file_url: fileUrl
            },
            ai_metadata: aiResult
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentOcrById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await req.supabase
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