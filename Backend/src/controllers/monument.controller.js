import * as monumentService from '../services/monument.service.js';
import { supabase } from '../config/supabaseClient.js';

export const getMapData = async (req, res, next) => {
    try {
        const pins = await monumentService.fetchMapPins();
        res.status(200).json({ success: true, data: pins });
    } catch (error) {
        next(error);
    }
};

export const getMonuments = async (req, res, next) => {
    try {
        // Extract query parameters like ?state=Gujarat&category=Temple
        const filters = {
            state: req.query.state,
            category: req.query.category,
            period: req.query.period,
            search: req.query.search
        };
        const monuments = await monumentService.fetchMonumentsList(filters);
        res.status(200).json({ success: true, data: monuments });
    } catch (error) {
        next(error);
    }
};

export const getMonumentById = async (req, res, next) => {
    try {
        const monument = await monumentService.fetchMonumentDetails(req.params.id);
        res.status(200).json({ success: true, data: monument });
    } catch (error) {
        next(error);
    }
};

export const getManuscriptTranslation = async (req, res, next) => {
    try {
        // For the hackathon demo, you can send this static JSON to match his UI
        // Later, this would be fetched from Supabase using the word ID
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
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const fileUrl = req.file.path;
        // The frontend should send these details when uploading
        const { monument_id, title, type } = req.body; 

        // 1. Save the file record to Supabase
        const { data, error } = await supabase
            .from('documents')
            .insert([
                { 
                    monument_id: monument_id, 
                    title: title || "Untitled Archive", 
                    type: type || "Image", 
                    file_url: fileUrl 
                }
            ])
            .select();

        if (error) throw new Error(error.message);

        res.status(201).json({
            success: true,
            message: "File uploaded and saved to archive successfully",
            document: data[0]
        });
    } catch (error) {
        next(error);
    }
};

export const get3DModelData = async (req, res, next) => {
    try {
        const { id } = req.params; // monument ID

        // Mock 3D data payload to power the frontend's WebGL/Three.js viewer
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