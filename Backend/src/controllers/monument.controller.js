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