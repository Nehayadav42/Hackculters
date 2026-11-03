
import { randomUUID } from "node:crypto";
import { supabase } from "../config/supabaseClient.js";
import AppError from "../utils/AppError.js";

// Generate public image URLs for monuments
async function attachThumbnailUrls(monuments) {
    if (!monuments || monuments.length === 0) {
        return monuments;
    }

    const siteIds = monuments.map((site) => site.id);

    const { data: mediaFiles, error } = await supabase
        .from("media")
        .select("site_id, file_path, title, is_cover, created_at")
        .in("site_id", siteIds)
        .eq("media_type", "photo")
        .order("created_at", { ascending: true });

    if (error) {
        throw new AppError(error.message, 500);
    }

    return monuments.map((site) => {
        const siteImages = (mediaFiles || []).filter(
            (file) => file.site_id === site.id
        );

        const selectedImage =
            siteImages.find((file) => file.is_cover) || siteImages[0];

        let thumbnailUrl = null;

        if (selectedImage?.file_path) {
            const { data } = supabase.storage
                .from("heritage-archives")
                .getPublicUrl(selectedImage.file_path);

            thumbnailUrl = data.publicUrl;
        }

        return {
            ...site,
            thumbnail_url: thumbnailUrl,
        };
    });
}

// Generate public URLs for document files
function attachDocumentUrls(documents = []) {
    return documents.map((document) => {
        let fileUrl = null;

        if (document.file_path) {
            const { data } = supabase.storage
                .from("heritage-archives")
                .getPublicUrl(document.file_path);

            fileUrl = data.publicUrl;
        }

        return {
            ...document,
            file_url: fileUrl,
        };
    });
}

// Fetch map pins
export const fetchMapPins = async () => {
    const { data, error } = await supabase
        .from("heritage_sites")
        .select("*");

    if (error) {
        throw new AppError(error.message, 500);
    }

    return data;
};

// Fetch monuments with filters and images
export const fetchMonumentsList = async (filters = {}) => {
    let query = supabase
        .from("heritage_sites")
        .select("*");

    if (filters.state) {
        query = query.eq("state", filters.state);
    }

    if (filters.category) {
        query = query.eq("category", filters.category);
    }

    if (filters.period) {
        query = query.eq("architectural_period", filters.period);
    }

    if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        throw new AppError(error.message, 500);
    }

    return await attachThumbnailUrls(data);
};

// Fetch individual monument details
export const fetchMonumentDetails = async (monumentId) => {
    const { data, error } = await supabase
        .from("heritage_sites")
        .select(`
            *,
            documents (
                id,
                title,
                document_type,
                file_path,
                ocr_text,
                original_text,
                translated_text,
                language,
                source_name
            )
        `)
        .eq("id", monumentId)
        .single();

    if (error) {
        throw new AppError(error.message, 404);
    }

    return data;
};

// Fetch all public images belonging to one monument
export const fetchMonumentImages = async (siteId) => {
    const { data, error } = await supabase
        .from("media")
        .select("id, site_id, title, file_path, is_cover, created_at")
        .eq("site_id", siteId)
        .eq("media_type", "photo")
        .order("created_at", { ascending: false });

    if (error) {
        throw new AppError(error.message, 500);
    }

    return (data || []).map((image) => {
        const { data: publicData } = supabase.storage
            .from("heritage-archives")
            .getPublicUrl(image.file_path);

        return {
            ...image,
            image_url: publicData.publicUrl,
        };
    });
};

// Upload a photo to Supabase Storage and register it in media table
export const uploadMonumentImage = async ({
    siteId,
    file,
    title,
}) => {
    const { data: site, error: siteError } = await supabase
        .from("heritage_sites")
        .select("id, name")
        .eq("id", siteId)
        .single();

    if (siteError || !site) {
        throw new AppError("Monument not found.", 404);
    }

    const extensionMap = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };

    const extension = extensionMap[file.mimetype];

    if (!extension) {
        throw new AppError(
            "Only JPG, PNG and WEBP images are allowed.",
            400
        );
    }

    const filePath = `${siteId}/${randomUUID()}.${extension}`;

    const { error: storageError } = await supabase.storage
        .from("heritage-archives")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: "3600",
            upsert: false,
        });

    if (storageError) {
        throw new AppError(storageError.message, 500);
    }

    const { data: mediaRecord, error: mediaError } = await supabase
        .from("media")
        .insert({
            site_id: siteId,
            file_path: filePath,
            title: title || file.originalname,
            media_type: "photo",
            is_cover: false,
        })
        .select()
        .single();

    if (mediaError) {
        await supabase.storage
            .from("heritage-archives")
            .remove([filePath]);

        throw new AppError(mediaError.message, 500);
    }

    const { data: publicData } = supabase.storage
        .from("heritage-archives")
        .getPublicUrl(filePath);

    return {
        ...mediaRecord,
        image_url: publicData.publicUrl,
    };
};
