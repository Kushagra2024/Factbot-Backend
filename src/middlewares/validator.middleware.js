import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

function validate(req, res, next) {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next();
    }

    const extractedError = result
        .array({ onlyFirstError: true })
        .map(({ path, msg }) => ({ [path]: msg }));

    next(new ApiError(400, "Validation failed", extractedError));
}

export { validate };
