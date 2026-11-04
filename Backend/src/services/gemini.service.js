import "dotenv/config";
import AppError from "../utils/AppError.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function generateGroundedAnswer(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new AppError(
            "AI features are not configured. Add GEMINI_API_KEY to Backend/.env to enable them.",
            503
        );
    }

    let response;

    try {
        response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 700
                }
            })
        });
    } catch {
        throw new AppError("AI provider is temporarily unavailable.", 502);
    }

    let payload;

    try {
        payload = await response.json();
    } catch {
        throw new AppError("AI provider returned an invalid response.", 502);
    }

    if (!response.ok) {
        throw new AppError("AI provider request failed.", 502);
    }

    const text = payload?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!text) {
        throw new AppError("AI provider returned no answer.", 502);
    }

    return text;
}
