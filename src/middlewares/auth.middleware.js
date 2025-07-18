import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import _CONFIG from "../config.js";

function isUserLoggedIn(req, res, next) {
    const accessToken = req.cookies["access-token"];

    if (!accessToken) {
        throw new ApiError(401, "Access token is missing from the request.", [
            "token_missing",
        ]);
    }

    let decoded;
    try {
        decoded = jwt.verify(accessToken, _CONFIG.JWT_ACCESS_TOKEN_SECRET);

        req.user = decoded.userId;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(
                401,
                "Your session has expired. Please log in again.",
                ["token_expired"]
            );
        }

        if (error.name === "Invalid signature") {
            throw new ApiError(
                401,
                "Access token is invalid or has been tampered with.",
                ["invalid_token"]
            );
        }

        throw new ApiError(
            500,
            "auth_verification_failed Authentication failed due to an internal error. Please try again later.",
            ["auth_verification_failed"]
        );
    }
}

export { isUserLoggedIn };

// error => if access token not present, if access token is expired
