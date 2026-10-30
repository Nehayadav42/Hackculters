import * as monumentService from '../services/monument.service.js';

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

export const uploadArchiveFile = async (req, res, next) => {
    try {
        // req.file is provided by the Multer middleware
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // The file is already securely uploaded to Cloudinary at this point
        const fileUrl = req.file.path;

        // Return the secure URL to the frontend so they can save it to the database
        res.status(201).json({
            success: true,
            message: "File uploaded successfully to cloud storage",
            file_url: fileUrl,
            file_type: req.file.mimetype
        });
    } catch (error) {
        next(error);
    }
};