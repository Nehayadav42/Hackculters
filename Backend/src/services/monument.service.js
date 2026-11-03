
import { supabase } from '../config/supabaseClient.js';
import AppError from '../utils/AppError.js';

// Generate public image URLs from Supabase Storage
async function attachThumbnailUrls(monuments) {
    if (!monuments || monuments.length === 0) {
        return monuments;
    }

    const siteIds = monuments.map((site) => site.id);

    const { data: mediaFiles, error } = await supabase
        .from('media')
        .select('site_id, file_path, title, is_cover, created_at')
        .in('site_id', siteIds)
        .eq('media_type', 'photo')
        .order('created_at', { ascending: true });

    if (error) {
        throw new AppError(error.message, 500);
    }

    return monuments.map((site) => {
        const siteImages = (mediaFiles || []).filter(
            (file) => file.site_id === site.id
        );

        // Prefer cover image, otherwise use first uploaded image
        const selectedImage =
            siteImages.find((file) => file.is_cover) || siteImages[0];

        let thumbnailUrl = null;

        if (selectedImage?.file_path) {
            const { data } = supabase.storage
                .from('heritage-archives')
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
                .from('heritage-archives')
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
        .from('heritage_sites')
        .select('*');

    if (error) {
        throw new AppError(error.message, 500);
    }

    return data;
};

// Fetch monuments with filters and images
export const fetchMonumentsList = async (filters = {}) => {
    let query = supabase
        .from('heritage_sites')
        .select('*');

    if (filters.state) {
        query = query.eq('state', filters.state);
    }

    if (filters.category) {
        query = query.eq('category', filters.category);
    }

    if (filters.period) {
        query = query.eq('architectural_period', filters.period);
    }

    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
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
        .from('heritage_sites') 
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
        .eq('id', monumentId)
        .single();

    if (error) {
        throw new AppError(error.message, 404);
    }

    return data;
};
