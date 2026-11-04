import axios from 'axios';
import FormData from 'form-data';
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import AppError from "../utils/AppError.js";
import { supabase } from "../config/supabaseClient.js";
import { DOCUMENTS_BUCKET } from "../config/documentStorage.js";

const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/process-document';
const supportedTypes = new Map([
    [".pdf", "application/pdf"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".txt", "text/plain"],
    [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
]);

export const processDocumentViaAI = async (fileBuffer, originalName, fileType, sourceLang, targetLang, docType) => {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: originalName, contentType: fileType });
        formData.append('source_language', sourceLang || 'auto');
        formData.append('output_language', targetLang || 'en');
        formData.append('document_type', docType || 'auto');

        const response = await axios.post(PYTHON_OCR_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 600000
        });

        return response.data;
    } catch (error) {
        const code = error.code || "HTTP_ERROR";
        const status = error.response?.status;
        console.error("[OCR Microservice Error]", { code, status });
        if (["ECONNREFUSED", "ENOTFOUND", "ECONNABORTED"].includes(code)) {
            throw new AppError(
                "The OCR service is unavailable. Please try again later.",
                503
            );
        }
        throw new AppError(
            "OCR could not process this document. Please verify the file and try again.",
            502
        );
    }
};

export const processAndSaveDocument = async ({
    file,
    siteId,
    title,
    documentType,
    sourceLanguage,
    targetLanguage,
    sourceName,
    sourceUrl,
}) => {
    if (!supabase) {
        throw new AppError("Document storage is not configured.", 503);
    }

    const originalName = file?.originalname;
    const extension = extname(originalName || "").toLowerCase();
    const expectedType = supportedTypes.get(extension);
    const fileBuffer = file?.buffer;

    if (
        !Buffer.isBuffer(fileBuffer) ||
        !expectedType ||
        file.mimetype !== expectedType
    ) {
        throw new AppError("The uploaded document is invalid or unsupported.", 400);
    }

    if (
        extension === ".pdf" &&
        !fileBuffer.subarray(0, 1024).includes(Buffer.from("%PDF-"))
    ) {
        throw new AppError("The uploaded file is not a valid PDF.", 400);
    }

    const storagePath = `${siteId || "unlinked"}/${randomUUID()}${extension}`;
    const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(storagePath, fileBuffer, {
            contentType: file.mimetype,
            cacheControl: "3600",
            upsert: false,
        });

    if (storageError) {
        console.error("[Document Storage Error]", storageError.code || "UNKNOWN");
        throw new AppError("Unable to store the uploaded document.", 502);
    }

    const { data: document, error: insertError } = await supabase
        .from("documents")
        .insert({
            site_id: siteId || null,
            title: title || originalName,
            document_type: documentType || "Document",
            file_path: storagePath,
            original_file_name: originalName,
            language: sourceLanguage || null,
            source_name: sourceName || null,
            source_url: sourceUrl || null,
            status: "processing",
        })
        .select()
        .single();

    if (insertError) {
        const { error: cleanupError } = await supabase.storage
            .from(DOCUMENTS_BUCKET)
            .remove([storagePath]);
        if (cleanupError) {
            console.error(
                "[Document Storage Cleanup Error]",
                cleanupError.code || "UNKNOWN"
            );
        }
        console.error("[Document Database Error]", insertError.code || "UNKNOWN");
        throw new AppError("Unable to create the document record.", 502);
    }

    try {
        const aiResult = await processDocumentViaAI(
            fileBuffer,
            originalName,
            file.mimetype,
            sourceLanguage || "auto",
            targetLanguage || "en",
            documentType || "auto"
        );

        if (
            !aiResult ||
            aiResult.success !== true ||
            typeof aiResult.original_text !== "string"
        ) {
            throw new AppError(
                "The OCR service returned an invalid result. Please try again.",
                502
            );
        }

        const { data: completedDocument, error: updateError } = await supabase
            .from("documents")
            .update({
                ocr_text: aiResult.original_text,
                original_text: aiResult.original_text,
                translated_text:
                    typeof aiResult.translated_text === "string"
                        ? aiResult.translated_text
                        : null,
                translated_language: aiResult.target_language || targetLanguage || null,
                ocr_engine: aiResult.ocr_engine || null,
                confidence_score:
                    typeof aiResult.ocr_confidence === "number"
                        ? aiResult.ocr_confidence
                        : null,
                language: aiResult.detected_source_language || sourceLanguage || null,
                status: "completed",
            })
            .eq("id", document.id)
            .select()
            .single();

        if (updateError) {
            console.error("[Document OCR Save Error]", updateError.code || "UNKNOWN");
            throw new AppError("OCR finished, but its result could not be saved.", 502);
        }

        return { document: completedDocument, aiResult };
    } catch (error) {
        try {
            const { error: statusError } = await supabase
                .from("documents")
                .update({ status: "failed" })
                .eq("id", document.id);

            if (statusError) {
                console.error(
                    "[Document Status Update Error]",
                    statusError.code || "UNKNOWN"
                );
            }
        } catch (statusError) {
            console.error(
                "[Document Status Update Error]",
                statusError?.code || "UNKNOWN"
            );
        }

        if (error instanceof AppError) {
            throw error;
        }

        console.error("[Document OCR Error]", error.code || "UNKNOWN");
        throw new AppError(
            "OCR processing failed. Please verify the document and try again.",
            502
        );
    }
};