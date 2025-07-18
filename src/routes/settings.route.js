import { Router } from "express";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import {
    getUserSettings,
    resetSettingsToDefault,
    updateUserSettings,
} from "../controllers/setting.controller.js";

const settingsRoute = Router();

settingsRoute.get("/", isUserLoggedIn, AsyncHandler(getUserSettings));

settingsRoute.patch(
    "/update",
    isUserLoggedIn,
    AsyncHandler(updateUserSettings)
);

settingsRoute.put(
    "/reset",
    isUserLoggedIn,
    AsyncHandler(resetSettingsToDefault)
);

export default settingsRoute;
