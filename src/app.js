import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorhandler } from "./middlewares/globalErrorhandler.js";
import _CONFIG from "./config.js";

const app = express();

app.use(
    cors({
        origin: _CONFIG.ORIGIN, // origin is set to '*' means wildcard which allows request from any origin, can't be used when credentials are involved.
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        maxAge: 600,
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(express.static("public"));

app.use(cookieParser());

// routes
import chatsRouter from "./routes/chats.route.js";
import userRoute from "./routes/auth.route.js";
import settingsRoute from "./routes/settings.route.js";

app.use("/factbot/api/v1/user", userRoute);

app.use("/factbot/api/v1/settings", settingsRoute);

app.use("/factbot/api/v1/chats", chatsRouter);

// global error handler
app.use(globalErrorhandler);

export { app };
