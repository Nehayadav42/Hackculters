import AppError from "../utils/AppError.js";
import { supabase } from "../config/supabaseClient.js";

export function requireSupabase(req, res, next) {
    if (!supabase) {
        return next(
            new AppError(
                "The archive database is unavailable. Configure SUPABASE_URL and SUPABASE_ANON_KEY in Backend/.env.",
                503
            )
        );
    }

    next();
}
