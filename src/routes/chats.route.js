import { Router } from "express";
import {
    getCurrentSession,
    addUserQueryToSession,
    addBotReplyToSession,
    getUserAllSessions,
    getSession,
} from "../controllers/chatSession.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const chatsRouter = Router();

chatsRouter.get("/", isUserLoggedIn, AsyncHandler(getCurrentSession));

chatsRouter.post("/query", isUserLoggedIn, AsyncHandler(addUserQueryToSession));
chatsRouter.get(
    "/getResponseFromGemini",
    isUserLoggedIn,
    AsyncHandler(addBotReplyToSession)
);
chatsRouter.get("/all", isUserLoggedIn, AsyncHandler(getUserAllSessions));
chatsRouter.get("/session/", isUserLoggedIn, AsyncHandler(getSession));

export default chatsRouter;
