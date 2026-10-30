const Location = require('../models/location.model');

exports.fetchLocationsForMap = async (lat, lng, radiusInMeters = 50000) => {
    // If coordinates are provided, do a complex Geospatial Search
    if (lat && lng) {
        return await Location.find({
            geometry: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: radiusInMeters
                }
            }
        }).select('name geometry thumbnailUrl'); // Only send lightweight data to the map
    }

    // Otherwise, return all locations (lightweight payload for frontend)
    return await Location.find().select('name geometry thumbnailUrl');
};