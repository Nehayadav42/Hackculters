import { supabase } from "./supabaseClient.js";

export const DOCUMENTS_BUCKET =
    process.env.SUPABASE_DOCUMENTS_BUCKET || "heritage-archives";

export function getDocumentFileUrl(filePath) {
    if (!filePath || typeof filePath !== "string") {
        return null;
    }

    if (/^https?:\/\//i.test(filePath)) {
        return filePath;
    }

    if (!supabase) {
        return null;
    }

    const { data } = supabase.storage
        .from(DOCUMENTS_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;
}
