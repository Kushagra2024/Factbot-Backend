import { configDotenv } from "dotenv";

configDotenv({ path: "./.env" });

const _CONFIG = Object.freeze({
    ENV: String(process.env.ENV),
    PORT: Number(process.env.PORT),
    MONGODB_URI: String(process.env.MONGODB_URI),
    ORIGIN:
        process.env.ORIGIN === "true" || process.env.ORIGIN === "false"
            ? Boolean(process.env.ORIGIN)
            : String(process.env.ORIGIN),
    SESSION_INACTIVE_TIME: Number(process.env.SESSION_INACTIVE_TIME),

    MAIL_HOST: String(process.env.MAIL_HOST),
    MAIL_PORT: Number(process.env.MAIL_PORT),
    MAIL_AUTH_USER: String(process.env.MAIL_AUTH_USER),
    MAIL_AUTH_PASSWORD: String(process.env.MAIL_AUTH_PASSWORD),

    CLOUDINARY_CLOUD_NAME: String(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: String(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_SECRET: String(process.env.CLOUDINARY_SECRET),

    VERIFICATION_SECRET_KEY: String(process.env.VERIFICATION_SECRET_KEY),
    VERIFICATION_TOKEN_EXPIRY: String(process.env.VERIFICATION_TOKEN_EXPIRY),

    JWT_ACCESS_TOKEN_SECRET: String(process.env.JWT_ACCESS_TOKEN_SECRET),
    JWT_ACCESS_TOKEN_EXPIRY: String(process.env.JWT_ACCESS_TOKEN_EXPIRY),

    JWT_REFRESH_TOKEN_SECRET: String(process.env.JWT_REFRESH_TOKEN_SECRET),
    JWT_REFRESH_TOKEN_EXPIRY: String(process.env.JWT_REFRESH_TOKEN_EXPIRY),

    JWT_FORGET_PASSWORD_TOKEN_SECRET: String(
        process.env.JWT_FORGET_PASSWORD_TOKEN_SECRET
    ),
    JWT_FORGET_PASSWORD_TOKEN_EXPIRY: String(
        process.env.JWT_FORGET_PASSWORD_TOKEN_EXPIRY
    ),
    GEMINI_API_KEY: String(process.env.GEMINI_API_KEY),
});

export default _CONFIG;
