
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // What the judges/frontend see
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        // Only show stack trace in development, never production
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};


export default errorHandler;
