import _CONFIG from "../config.js";

class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        errors = []
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);

        if (_CONFIG.ENV === "development") {
            this.stackTrace = this.stack;
        }
    }
}

export { ApiError };
