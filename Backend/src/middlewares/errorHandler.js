
const errorHandler = (err, req, res, next) => {
    const isMulterError = err.name === "MulterError";
    const statusCode =
        err.statusCode ||
        (isMulterError && err.code === "LIMIT_FILE_SIZE"
            ? 413
            : isMulterError
                ? 400
                : 500);
    const message =
        err.isOperational || statusCode < 500
            ? err.message
            : "Something went wrong while processing the request.";

    res.status(statusCode).json({
        success: false,
        status: statusCode < 500 ? "fail" : "error",
        message:
            isMulterError && err.code === "LIMIT_FILE_SIZE"
                ? "The uploaded file exceeds the allowed size limit."
                : message,
        // Only show stack trace in development, never production
        stack:
            process.env.NODE_ENV === "development" && statusCode >= 500
                ? err.stack
                : undefined
    });
};


export default errorHandler;
