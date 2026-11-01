
import { supabase } from '../config/supabaseClient.js';
import AppError from '../utils/AppError.js';

// Fetch data for the interactive map
export const fetchMapPins = async () => {
    const { data, error } = await supabase
        .from('heritage_sites')
        .select('*');

    if (error) throw new AppError(error.message, 500);
    return data;
};

// Fetch monuments with optional filters
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

    if (error) throw new AppError(error.message, 500);
    return data;
};

// Fetch one monument with its associated documents
export const fetchMonumentDetails = async (monumentId) => {
    const { data, error } = await supabase
        .from('heritage_sites')
        .select(`
            *,
            documents (
                id,
                title,
                type,
                file_url
            )
        `)
        .eq('id', monumentId)
        .single();

    if (error) {
        throw new AppError(error.message, 404);
    }

    return data;
};
