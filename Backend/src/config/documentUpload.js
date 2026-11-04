import multer from "multer";
import AppError from "../utils/AppError.js";

const allowedTypes = new Map([
    [".pdf", "application/pdf"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".txt", "text/plain"],
    [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
]);

export const createDocumentUpload = (fieldName, allowedExtensions) =>
    multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 25 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
            const extension = file.originalname
                .slice(file.originalname.lastIndexOf("."))
                .toLowerCase();
            const expectedType = allowedTypes.get(extension);

            if (
                !expectedType ||
                !allowedExtensions.includes(extension) ||
                file.mimetype !== expectedType
            ) {
                return callback(
                    new AppError(
                        "Unsupported file type. Please choose a supported document.",
                        400
                    )
                );
            }

            callback(null, true);
        },
    }).single(fieldName);
