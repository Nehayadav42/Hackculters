const locationService = require('../services/location.service');

exports.getMapPins = async (req, res, next) => {
    try {
        const { lat, lng, radius } = req.query;
        // Pass data to the service layer
        const pins = await locationService.fetchLocationsForMap(lat, lng, radius);
        
        res.status(200).json({
            success: true,
            count: pins.length,
            data: pins
        });
    } catch (error) {
        next(error); // Passes to global errorHandler
    }
};