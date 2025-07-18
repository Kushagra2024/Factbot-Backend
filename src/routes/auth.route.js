import { Router } from "express";
import {
    getUserProfile,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    resendVerificationMail,
    verifyUser,
    changeCurrentPassword,
    forgetPasswordRequest,
    resetPassword,
} from "../controllers/auth.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
import {
    userLoginvalidator,
    userRegistrationValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import fileUploader from "../utils/fileUploader.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const userRoute = Router();

userRoute.post(
    "/register",
    fileUploader().single("avatar"),
    userRegistrationValidator(),
    validate,
    AsyncHandler(registerUser)
);

userRoute.get("/verify", AsyncHandler(verifyUser));

userRoute.post(
    "/login",
    userLoginvalidator(),
    validate,
    AsyncHandler(loginUser)
);

userRoute.post("/logout", isUserLoggedIn, AsyncHandler(logoutUser));

userRoute.get(
    "/me",
    AsyncHandler(isUserLoggedIn),
    AsyncHandler(getUserProfile)
);

userRoute.patch(
    "/change-password",
    isUserLoggedIn,
    AsyncHandler(changeCurrentPassword)
);

userRoute.post("/forget-password", AsyncHandler(forgetPasswordRequest));

userRoute.patch("/reset-password", AsyncHandler(resetPassword));

userRoute.post("/resend-verification", AsyncHandler(resendVerificationMail));

userRoute.get("/refresh-access-token", AsyncHandler(refreshAccessToken));

export default userRoute;
