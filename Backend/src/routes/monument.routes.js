
import express from "express";
import multer from "multer";
import * as monumentController from "../controllers/monument.controller.js";
import upload, { requireCloudinary } from "../config/storage.js";
import { requireSupabase } from "../middlewares/requireSupabase.js";
import { requireAuthenticatedUser } from "../middlewares/requireAuthenticatedUser.js";

const router = express.Router();

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, PNG and WEBP images are allowed.")
            );
        }

        cb(null, true);
    },
});

router.use(requireSupabase);

// Static routes first
router.get("/map-data", monumentController.getMapData);
router.get("/search/all", monumentController.searchArchives);
router.get("/manuscript/:word", monumentController.getManuscriptTranslation);

// Existing document upload — unchanged
router.post(
    "/upload",
    requireAuthenticatedUser,
    requireCloudinary,
    upload.single("archive_file"),
    monumentController.uploadArchiveFile
);

// Monument image gallery routes
router.get(
    "/:id/images",
    monumentController.getMonumentImages
);

router.post(
    "/:id/images",
    requireAuthenticatedUser,
    imageUpload.single("image"),
    monumentController.addMonumentImage
);

// General monument routes
router.get("/", monumentController.getMonuments);
router.get("/:id", monumentController.getMonumentById);

export default router;
