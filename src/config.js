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
});

export default _CONFIG;
