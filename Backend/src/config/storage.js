
import "dotenv/config";
import { randomUUID } from "node:crypto";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import AppError from "../utils/AppError.js";

const cloudinaryCredentials = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};
const cloudinaryConfigured = Object.values(cloudinaryCredentials).every(Boolean);

if (cloudinaryConfigured) {
    cloudinary.v2.config(cloudinaryCredentials);
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (_req, file) => {
        const resourceType = file.mimetype.startsWith("image/")
            ? "image"
            : "raw";
        const extension = file.originalname.match(/\.[^.]+$/)?.[0] || "";
        const safeName = file.originalname
            .replace(/\.[^.]+$/, "")
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9_-]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 100) || "archive";

            return {
                folder: "cultural_heritage_archives",
                resource_type: resourceType,
                public_id: `${randomUUID()}-${safeName}${resourceType === "raw" ? extension : ""}`,
            };
    },
});

export function requireCloudinary(req, res, next) {
    if (!cloudinaryConfigured) {
        return next(
            new AppError(
                "File uploads are unavailable. Configure the Cloudinary credentials in Backend/.env.",
                503
            )
        );
    }

    next();
}

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = new Set([
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]);

        if (!allowedTypes.has(file.mimetype)) {
            callback(
                new AppError(
                    "Only JPG, PNG, WEBP, PDF, TXT, and DOCX files are allowed.",
                    400
                )
            );
            return;
        }

        callback(null, true);
    },
});

export default upload;
