import { ApiError } from "../utils/ApiError.js";
import _CONFIG from "../config.js";

function globalErrorhandler(err, _, res, next) {
    if (_CONFIG.ENV !== "development") {
        err.stack = null;
    }

    const statusCode = err?.statusCode || 500;
    const message =
        err instanceof ApiError ? err?.message : "Internal Server Error";
    const errors = err.errors || [];
    const data = null;
    const success = false;

    return res.status(statusCode).json({
        statusCode,
        data,
        message,
        success,
        errors,
    });
}

export { globalErrorhandler };
