import { supabase } from '../config/supabaseClient.js';
import { processAndSaveDocument } from '../services/ocr.service.js';
import { getDocumentFileUrl } from "../config/documentStorage.js";
import AppError from "../utils/AppError.js";

export const processOcrDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError("No file provided.", 400);
        }

        const { site_id, title, source_language, output_language, document_type } = req.body;
        const { document, aiResult } = await processAndSaveDocument({
            file: req.file,
            siteId: site_id,
            title,
            documentType: document_type,
            sourceLanguage: source_language || "auto",
            targetLanguage: output_language || "en",
        });

        res.status(201).json({
            success: true,
            data: {
                ...document,
                file_url: getDocumentFileUrl(document.file_path),
            },
            ai_metadata: aiResult,
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentOcrById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ success: false, message: "Document not found" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
