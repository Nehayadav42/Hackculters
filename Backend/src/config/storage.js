
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Requires CLOUDINARY_URL or keys in your .env file
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: "cultural_heritage_archives",
        allowed_formats: ["jpg", "png", "pdf"], // Restrict dangerous file types
    },
});

const upload = multer({ storage: storage });

export default upload;
