import * as monumentService from "../services/monument.service.js";
import {
    fetchMonumentImages,
    uploadMonumentImage
} from "../services/monument.service.js";
import { supabase } from '../config/supabaseClient.js';
import { ocrQueue } from '../workers/ocrWorker.js';

// Get map data
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

// Get monuments with filters
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

// Get individual monument details
export const getMonumentById = async (req, res, next) => {
    try {
        const monument = await monumentService.fetchMonumentDetails(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: monument
        });
    } catch (error) {
        next(error);
    }
};

// Manuscript translation
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

// Upload archive document
export const uploadArchiveFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const {
            site_id,
            monument_id,
            title,
            document_type,
            category,
            language,
            source_name,
            source_url
        } = req.body;

        // Support old frontend field names too
        const siteId = site_id || monument_id;
        const documentType = document_type || category || "Document";

        if (!siteId) {
            return res.status(400).json({
                success: false,
                message: "Site ID is required"
            });
        }

        const filePath = req.file.path;

        const { data, error } = await supabase
            .from('documents')
            .insert([{
                site_id: siteId,
                title: title || req.file.originalname || "Untitled",
                document_type: documentType,
                file_path: filePath,
                original_file_name: req.file.originalname,
                language: language || "English",
                source_name: source_name || null,
                source_url: source_url || null,
                status: "pending"
            }])
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        // Queue OCR for supported documents
        if (
            documentType.toLowerCase().includes('manuscript') ||
            documentType.toLowerCase().includes('document') ||
            documentType.toLowerCase().includes('application/pdf')
        ) {
            await ocrQueue.add('extract-text', {
                documentId: data.id,
                filePath
            });
        }

        res.status(201).json({
            success: true,
            message: "File uploaded successfully.",
            document: data
        });

    } catch (error) {
        next(error);
    }
};

// Get 3D model data
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

// Search monuments and archive documents
export const searchArchives = async (req, res, next) => {
    try {
        const q = req.query.q?.trim();

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Escape special PostgREST filter characters
        const safeQuery = q.replace(/[,%()]/g, ' ').trim();

        if (!safeQuery) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid search query"
            });
        }

        // Search heritage sites
        const { data: monuments, error: monError } = await supabase
            .from('heritage_sites')
            .select('id, name, category, state, thumbnail_url, description')
            .or(
                `name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
            );

        if (monError) {
            throw new Error(monError.message);
        }

        // Search documents using actual database columns
        const { data: documents, error: docError } = await supabase
            .from('documents')
            .select(`
                id,
                site_id,
                title,
                document_type,
                file_path,
                original_file_name,
                language,
                original_text,
                ocr_text,
                source_name,
                source_url,
                status,
                created_at
            `)
            .or(
                `title.ilike.%${safeQuery}%,original_file_name.ilike.%${safeQuery}%,original_text.ilike.%${safeQuery}%,ocr_text.ilike.%${safeQuery}%`
            );

        if (docError) {
            throw new Error(docError.message);
        }

        // Generate public URLs for document files
        const documentsWithUrls = (documents || []).map((document) => {
            let fileUrl = null;

            if (document.file_path) {
                const { data } = supabase.storage
                    .from('heritage-archives')
                    .getPublicUrl(document.file_path);

                fileUrl = data.publicUrl;
            }

            return {
                ...document,
                file_url: fileUrl
            };
        });

        res.status(200).json({
            success: true,
            results: {
                monumentsFound: monuments?.length || 0,
                documentsFound: documentsWithUrls.length,
                monuments: monuments || [],
                documents: documentsWithUrls
            }
        });

    } catch (error) {
        next(error);
    }
};


export const getMonumentImages = async (req, res, next) => {
    try {
        const images = await fetchMonumentImages(req.params.id);

        res.status(200).json({
            success: true,
            data: images,
        });
    } catch (error) {
        next(error);
    }
};

export const addMonumentImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image.",
            });
        }

        const image = await uploadMonumentImage({
            siteId: req.params.id,
            file: req.file,
            title: req.body.title,
        });

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully.",
            data: image,
        });
    } catch (error) {
        next(error);
    }
};
