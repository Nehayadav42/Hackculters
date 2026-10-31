import { supabase } from '../config/supabaseClient.js';
import AppError from '../utils/AppError.js';

// 1. Fetch data for the Interactive Map
export const fetchMapPins = async () => {
    const { data, error } = await supabase
  .from('heritage_sites')
  .select('*');

    if (error) throw new AppError(error.message, 500);
    return data;
};

// 2. Fetch data for the "Explore Monuments" List View with Filters
export const fetchMonumentsList = async (filters = {}) => {
    let query = supabase.from('heritage_sites').select('*');

    // Apply filters from the UI dropdowns
    if (filters.state) query = query.eq('state', filters.state);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.period) query = query.eq('period', filters.period);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    return data;
};

// 3. Fetch specific Monument Details + Documents (For the Details Page)
export const fetchMonumentDetails = async (monumentId) => {
    const { data, error } = await supabase
        .from('heritage_')
        .select(`
            *,
            documents ( id, title, type, file_url )
        `)
        .eq('id', monumentId)
        .single();

    if (error) throw new AppError(error.message, 404);
    return data;
};