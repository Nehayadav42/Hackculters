import AppError from "../utils/AppError.js";
import {
    createAuthenticatedSupabaseClient,
    supabase,
} from "../config/supabaseClient.js";

export async function requireAuthenticatedUser(req, res, next) {
    const authorization = req.get("authorization") || "";
    const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!accessToken) {
        return next(new AppError("Sign in before submitting archive contributions.", 401));
    }

    if (!supabase) {
        return next(
            new AppError(
                "The archive database is unavailable. Configure Supabase before accepting contributions.",
                503
            )
        );
    }

    try {
        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error || !data.user) {
            return next(new AppError("Your session is invalid or expired. Sign in again.", 401));
        }

        const userClient = createAuthenticatedSupabaseClient(accessToken);
        if (!userClient) {
            return next(new AppError("Authenticated archive access is unavailable.", 503));
        }

        req.user = data.user;
        req.supabase = userClient;
        next();
    } catch (error) {
        next(error);
    }
}
