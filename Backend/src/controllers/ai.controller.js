import { supabase } from "../config/supabaseClient.js";
import { fetchMonumentDetails } from "../services/monument.service.js";
import { generateGroundedAnswer } from "../services/gemini.service.js";
import AppError from "../utils/AppError.js";

function documentSource(document, index) {
    return {
        id: document.id,
        label: `S${index + 1}`,
        title: document.title || `Archive document ${index + 1}`,
        url: document.file_url || document.file_path || null,
        excerpt: [
            document.ocr_text,
            document.original_text,
            document.translated_text
        ]
            .find((value) => typeof value === "string" && value.trim())
            ?.slice(0, 1800) || ""
    };
}

function buildMonumentContext(monument) {
    const documents = (monument.documents || [])
        .map(documentSource)
        .filter((source) => source.excerpt);

    const details = [
        ["Name", monument.name || monument.title],
        ["Location", [monument.city, monument.state].filter(Boolean).join(", ")],
        ["Period", monument.architectural_period || monument.period || monument.era],
        ["Category", monument.category || monument.type],
        ["Description", monument.description || monument.overview || monument.summary],
        ["History", monument.history || monument.historical_significance],
        ["Architecture", monument.architecture || monument.architectural_details]
    ]
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`);

    const documentContext = documents
        .map((source) => `[${source.label}] ${source.title}\n${source.excerpt}`)
        .join("\n\n");

    return {
        text: [...details, documentContext].filter(Boolean).join("\n\n").slice(0, 12000),
        sources: documents.map(({ label, title, url }) => ({ label, title, url }))
    };
}

export const summarizeDocument = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (typeof documentId !== "string" || !documentId.trim()) {
            throw new AppError("A document ID is required.", 400);
        }

        const { data: document, error } = await supabase
            .from("documents")
            .select("id, title, original_text, ocr_text, translated_text, file_path, source_name")
            .eq("id", documentId)
            .single();

        if (error || !document) {
            throw new AppError("The requested archive document was not found.", 404);
        }

        const sourceText =
            document.ocr_text ||
            document.original_text ||
            document.translated_text;

        if (!sourceText?.trim()) {
            throw new AppError(
                "This document has no extracted text to summarize. Run OCR first.",
                409
            );
        }

        const summary = await generateGroundedAnswer(
            `Summarize this cultural heritage archive transcription in clear, concise language. ` +
            `Only use the supplied text. Preserve uncertainty and do not invent facts.\n\n` +
            `Document: ${document.title || "Untitled"}\n${sourceText.slice(0, 12000)}`
        );

        res.status(200).json({
            success: true,
            summary,
            sources: [
                {
                    title: document.title || "Untitled document",
                    url: document.file_path || null,
                    source_name: document.source_name || null
                }
            ]
        });
    } catch (error) {
        next(error);
    }
};

export const chatWithAssistant = async (req, res, next) => {
    try {
        const { monumentId, question } = req.body;

        if (typeof monumentId !== "string" || !monumentId.trim()) {
            throw new AppError("A monument ID is required.", 400);
        }

        if (typeof question !== "string" || !question.trim()) {
            throw new AppError("Enter a question about this heritage record.", 400);
        }

        if (question.length > 1000) {
            throw new AppError("Questions must be 1,000 characters or fewer.", 400);
        }

        const monument = await fetchMonumentDetails(monumentId);
        const context = buildMonumentContext(monument);

        if (!context.text.trim()) {
            throw new AppError(
                "This record does not yet contain enough source material for an archive answer.",
                409
            );
        }

        const answer = await generateGroundedAnswer(
            `You are a careful cultural-heritage archive assistant. Answer the user's question ` +
            `using only the supplied record. Never invent dates, claims, or citations. If the ` +
            `record does not contain the answer, say that the archive does not establish it. ` +
            `Cite claims with the provided source labels such as [S1].\n\n` +
            `ARCHIVE RECORD:\n${context.text}\n\nQUESTION:\n${question.trim()}`
        );

        res.status(200).json({
            success: true,
            answer,
            sources: context.sources
        });
    } catch (error) {
        next(error);
    }
};
