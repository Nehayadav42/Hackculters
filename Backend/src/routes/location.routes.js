const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const upload = require('../middlewares/upload'); // Your Multer setup

router.post('/', upload.single('thumbnail'), locationController.createLocation);
router.get('/map-data', locationController.getMapPins);
router.get('/:id/archive', locationController.getLocationArchive);

module.exports = router;