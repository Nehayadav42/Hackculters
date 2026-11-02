
import * as monumentService from '../services/monument.service.js';
import { supabase } from '../config/supabaseClient.js';
import { ocrQueue } from '../workers/ocrWorker.js';

export const getMapData = async (req, res, next) => {
    try {
        const pins = await monumentService.fetchMapPins();

        res.status(200).json({
            success: true,
            data: pins
        });
    } catch (error) {
        next(error);
    }
};

export const getMonuments = async (req, res, next) => {
    try {
        const filters = {
            state: req.query.state,
            category: req.query.category,
            period: req.query.period,
            search: req.query.search
        };

        const monuments = await monumentService.fetchMonumentsList(filters);

        res.status(200).json({
            success: true,
            data: monuments
        });
    } catch (error) {
        next(error);
    }
};

export const getMonumentById = async (req, res, next) => {
    try {
        const monument = await monumentService.fetchMonumentDetails(req.params.id);

        res.status(200).json({
            success: true,
            data: monument
        });
    } catch (error) {
        next(error);
    }
};

export const getManuscriptTranslation = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                original: "गणेशाय",
                transliteration: "ganesaya",
                english: "to Ganesha",
                meaning: "Ganesha in the dative case: an invocation addressed to him. The ending -aya means 'to'."
            }
        });
    } catch (error) {
        next(error);
    }
};

export const uploadArchiveFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const fileUrl = req.file.path;
        const { monument_id, title, category } = req.body;

        const { data, error } = await supabase
            .from('documents')
            .insert([{
                monument_id,
                title: title || "Untitled",
                category: category || "Document",
                file_url: fileUrl
            }])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        const savedDocument = data[0];

        if (category === 'Manuscript' || category === 'Document') {
            await ocrQueue.add('extract-text', {
                documentId: savedDocument.id,
                fileUrl
            });
        }

        res.status(201).json({
            success: true,
            message: "File uploaded! OCR text extraction is running in the background.",
            document: savedDocument
        });
    } catch (error) {
        next(error);
    }
};

export const get3DModelData = async (req, res, next) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            success: true,
            data: {
                monument_id: id,
                model_url: "https://example.com/models/rani-ki-vav.gltf",
                wireframe_url: "https://example.com/models/rani-ki-vav-wireframe.obj",
                total_photos_processed: 1344,
                geometry_points: 672
            }
        });
    } catch (error) {
        next(error);
    }
};

export const searchArchives = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const { data: monuments, error: monError } = await supabase
            .from('monuments')
            .select('id, name, category, state, thumbnail_url')
            .or(`name.ilike.%${q}%,description.ilike.%${q}%`);

        if (monError) {
            throw new Error(monError.message);
        }

        const { data: documents, error: docError } = await supabase
            .from('documents')
            .select('id, title, category, monument_id, file_url')
            .or(`title.ilike.%${q}%,extracted_text.ilike.%${q}%`);

        if (docError) {
            throw new Error(docError.message);
        }

        res.status(200).json({
            success: true,
            results: {
                monumentsFound: monuments.length,
                documentsFound: documents.length,
                monuments,
                documents
            }
        });
    } catch (error) {
        next(error);
    }
};
