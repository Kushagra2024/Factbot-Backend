function globalErrorhandler(err, req, res) {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        data: err.data,
        message: err.message,
        success: err.success,
        errors: err.errors,
    });
}

export { globalErrorhandler };
