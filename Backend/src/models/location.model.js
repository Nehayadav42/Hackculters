const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    // GeoJSON for spatial queries (e.g., "Find stepwells near me")
    geometry: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    thumbnailUrl: { type: String },
    // Linking unstructured data
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }] 
}, { timestamps: true });

// Crucial for map performance
LocationSchema.index({ geometry: '2dsphere' }); 

module.exports = mongoose.model('Location', LocationSchema);