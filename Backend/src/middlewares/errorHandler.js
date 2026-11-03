
const errorHandler = (err, req, res, next) => {
    const isMulterError = err.name === "MulterError";
    const statusCode =
        err.statusCode ||
        (err.code === "LIMIT_FILE_SIZE" ? 413 : isMulterError ? 400 : 500);
    const status = err.status || (statusCode < 500 ? "fail" : "error");

    // What the judges/frontend see
    res.status(statusCode).json({
        success: false,
        status,
        message: err.message,
        // Only show stack trace in development, never production
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};


export default errorHandler;
