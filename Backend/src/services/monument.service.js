
import { supabase } from '../config/supabaseClient.js';
import AppError from '../utils/AppError.js';

export const fetchMapPins = async () => {
    const { data, error } = await supabase
        .from('heritage_sites')
        .select('*');

    if (error) throw new AppError(error.message, 500);

    return data;
};

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

export const fetchMonumentDetails = async (monumentId) => {
    const { data, error } = await supabase
        .from('heritage_sites')
        .select(`
            *,
            documents (
                id,
                title,
                category,
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
