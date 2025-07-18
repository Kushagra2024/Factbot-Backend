import _CONFIG from "../config.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import send from "../utils/SendMail.js";
import _CONSTANTS from "../constants.js";
import cloudinaryFileUpload from "../utils/Cloudinary.js";

async function registerUser(req, res) {
    // get user name, email, and password
    const { fname, lname, email, password } = req.body;

    // validate user data
    if (!fname || !lname || !email || !password) {
        throw new ApiError(403, "Registration Failed", [
            {
                fname: !fname ? "First name is missing" : undefined,
                lname: !lname ? "Last name is missing" : undefined,
                email: !email ? "Email is missing" : undefined,
                password: !password ? "Password is missing" : undefined,
            },
        ]);
    }

    // check if user already exists or not
    const existingUser = await User.findOne({ email });

    // if exists and is verified, show already exists
    if (existingUser && existingUser.isVerified) {
        throw new ApiError(400, "Registration Failed", ["User Already Exists"]);
    }

    // if exists and is not verified
    if (existingUser && !existingUser.isVerified) {
        throw new ApiError(400, "registration failed", [
            "User is already registered, but unverfied",
        ]);
        // return res
        //     .status(201)
        //     .json(
        //         new ApiResponse(
        //             201,
        //             [{ verified: false }],
        //             "user already registered and unverified"
        //         )
        //     );
    }

    // create a verification token
    const verificationToken = jwt.sign(
        { email },
        _CONFIG.VERIFICATION_SECRET_KEY,
        { expiresIn: _CONFIG.VERIFICATION_TOKEN_EXPIRY }
    );

    // if not, create new user and save verification token in db
    const avatarLocalPath = req.file?.path;

    const avatarCloudinaryURL = avatarLocalPath
        ? await cloudinaryFileUpload(avatarLocalPath)
        : "";

    let user = undefined;
    try {
        user = await User.create({
            fname,
            lname,
            email,
            password,
            verificationToken,
            avatar: avatarCloudinaryURL,
        });
    } catch (error) {
        throw new ApiError(400, "User Registration Failed", [error.message]);
    }

    // send verification email, token attached with it
    try {
        await send.verificationMail(
            email,
            fname,
            lname,
            _CONSTANTS.VERIFICATION_ENDPOINT,
            verificationToken
        );
    } catch (error) {
        throw new ApiError(201, "User registration failed", [error.message]);
    }

    // send success status to user
    res.status(200).json(
        new ApiResponse(
            200,
            [{ userId: user.id }],
            "user registered successfully and verification mail sent to user"
        )
    );
}

async function verifyUser(req, res) {
    // get token from query parameter
    const token = req.query.token;

    // check if user with extracted token exists or not
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        throw new ApiError(400, "Failed to verify user", ["User not found"]);
    }

    // verify jwt token and get user email id
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, _CONFIG.VERIFICATION_SECRET_KEY);
    } catch (error) {
        // send the verification mail to user again if failed due to link got expired
        if (error.name === "TokenExpiredError") {
            throw new ApiError(400, "Failed to verify user", ["Link expired"]);
        }
        throw new ApiError(400, "Failed to verify user", ["User not found"]);
    }

    // check if decode and found users are same
    if (!(decoded.email === user.email)) {
        throw new ApiError(400, "Failed to verify user");
    }

    // check if user is already verified
    if (user.isVerified) {
        throw new ApiError(400, "Verification failed", [
            "User already verified",
        ]);
    }

    // mark user verified
    user.$set({ isVerified: true, verificationToken: null });
    await user.save();

    // send success response
    res.status(200).json(
        new ApiResponse(200, [], "user verified successfully")
    );
}

async function loginUser(req, res) {
    // get user email and password
    const { email, password } = req.body;

    // validate email and password
    if (!email || !password) {
        throw new ApiError(400, "User login failed", [
            {
                email: !email ? "Email is required" : "",
                password: !password ? "password is required" : "",
            },
        ]);
    }

    const user = await User.findOne({ email })?.populate("chatPreference");

    // check if user exists or not
    if (!user) {
        throw new ApiError(400, "User login failed", ["user not found"]);
    }

    // password verification through instance method
    const passwordMatched = await user.verifyPassword(password);

    // check if passsword matches or not
    if (!passwordMatched) {
        throw new ApiError(400, "User login failed", [
            "email or password does not match",
        ]);
    }

    // check if user is verified or not
    const isVerified = user.isVerified;

    if (!isVerified) {
        throw new ApiError(400, "User login failed", ["User not verified"]);
    }

    const access_token = jwt.sign(
        { userId: user._id },
        _CONFIG.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: _CONFIG.JWT_ACCESS_TOKEN_EXPIRY,
        }
    );

    const refresh_token = jwt.sign(
        { userId: user._id },
        _CONFIG.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: _CONFIG.JWT_REFRESH_TOKEN_EXPIRY,
        }
    );

    try {
        user.$set({ refreshToken: refresh_token });
        await user.save();
    } catch (error) {
        throw new ApiError(400, "Login failed");
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    const { _id, fname, lname, avatar, theme, chatPreference } = user;

    return res
        .status(200)
        .cookie("access-token", access_token, cookieOptions)
        .cookie("refresh-token", refresh_token, cookieOptions)
        .json(
            new ApiResponse(
                200,
                [
                    {
                        _id,
                        fname,
                        lname,
                        email,
                        avatar,
                        theme,
                        chatPreference,
                    },
                ],
                "Login Successfull"
            )
        );
}

async function logoutUser(req, res) {
    const userId = req.user;

    try {
        const user = await User.findById(userId);
        user.$set({ refreshToken: null });
        await user.save();
    } catch (error) {
        throw new ApiError(400, "Logout failed");
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 0,
    };

    res.status(200)
        .cookie("access-token", "", cookieOptions)
        .cookie("refresh-token", "", cookieOptions)
        .json(new ApiResponse(200, [], "User logged out successfully"));
}

async function resendVerificationMail(req, res) {
    const userId = req.user;

    const user = await User.findById(userId);

    if (user?.isVerified) {
        throw new ApiError(400, "Failed to send verification mail", [
            "user is already verified",
        ]);
    }

    const verificationToken = jwt.sign(
        { email: user.email },
        _CONFIG.VERIFICATION_SECRET_KEY,
        {
            expiresIn: _CONFIG.VERIFICATION_TOKEN_EXPIRY,
        }
    );

    try {
        user.$set({ verificationToken: verificationToken });
        await user.save();
    } catch (error) {
        throw new ApiError(400, "Failed to send verification mail");
    }

    try {
        const { fname, lname, email } = user;
        await send.verificationMail(
            fname,
            lname,
            email,
            _CONSTANTS.VERIFICATION_ENDPOINT,
            verificationToken
        );
    } catch (error) {
        throw new ApiError(400, "Failed to send verification mail");
    }

    res.status(200).json(
        new ApiResponse(200, [], "verification mail sent successfully")
    );
}

async function refreshAccessToken(req, res) {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
        throw new ApiError(401, "Failed to refresh access token", [
            "refresh token missing",
        ]);
    }

    let user = undefined;
    try {
        user = await User.findOne({ refreshToken: refreshToken });
    } catch (error) {
        throw new ApiError(401, "Failed to refresh access token", [
            "Invalid refresh token",
        ]);
    }

    let decoded = undefined;
    try {
        decoded = jwt.verify(refreshToken, _CONFIG.JWT_REFRESH_TOKEN_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError")
            throw new ApiError(401, "Failed to refresh access token", [
                "refresh token expired",
            ]);

        throw new ApiError(401, "Failed to refresh access token", [
            "Failed to verify refresh token",
        ]);
    }

    if (String(user._id) !== decoded.userId) {
        throw new ApiError(401, "Failed to refresh access token", [
            "invalid refresh token",
        ]);
    }

    const newRefreshToken = jwt.sign(
        { userId: user._id },
        _CONFIG.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: _CONFIG.JWT_REFRESH_TOKEN_EXPIRY,
        }
    );

    const newAccesstoken = jwt.sign(
        { userId: user._id },
        _CONFIG.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: _CONFIG.JWT_ACCESS_TOKEN_EXPIRY,
        }
    );

    try {
        user.$set({ refreshToken: newRefreshToken });
        await user.save();
    } catch (error) {
        throw new ApiError(401, "failed to refresh token");
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("access-token", newAccesstoken, cookieOptions)
        .cookie("refresh-token", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                [newAccesstoken],
                "Access token refreshed successfully"
            )
        );
}

async function getUserProfile(req, res) {
    const userId = req.user;

    const user = await User.findById(userId)?.populate("chatPreference");

    if (!user) {
        throw new ApiError(400, "Failed to get user profile", [
            "user not found",
        ]);
    }

    const { _id, fname, lname, email, avatar, theme, chatPreference } = user;

    res.status(200).json(
        new ApiResponse(
            200,
            [
                {
                    _id,
                    fname,
                    lname,
                    email,
                    avatar,
                    theme,
                    chatPreference,
                },
            ],
            "Fetched user data successfully"
        )
    );
}

async function changeCurrentPassword(req, res) {
    const userId = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError("400", "Change password failed", ["User not found"]);
    }

    const isPasswordMatched = await user.verifyPassword(oldPassword);

    if (!isPasswordMatched) {
        throw new ApiError(400, "Password does not matched");
    }

    user.$set({ password: newPassword });
    await user.save();

    res.status(200).json(
        new ApiResponse(200, [], "Password changed successfully")
    );
}

async function forgetPasswordRequest(req, res) {
    const email = req.body.email;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "Change forget password request failed", [
            ["User not found"],
        ]);
    }

    const resetPasswordToken = jwt.sign(
        {
            userId: user._id,
        },
        _CONFIG.JWT_FORGET_PASSWORD_TOKEN_SECRET,
        {
            expiresIn: _CONFIG.JWT_FORGET_PASSWORD_TOKEN_EXPIRY,
        }
    );

    try {
        user.$set({ resetPasswordToken: resetPasswordToken });
        await user.save();
    } catch (error) {
        throw new ApiError(400, "Change forget password request failed", [
            ["failed to save reset password token"],
        ]);
    }

    try {
        const { fname, lname, email } = user;
        await send.passwordResetMail(
            email,
            fname,
            lname,
            _CONSTANTS.RESET_PASSWORD_ENDPOINT,
            resetPasswordToken
        );
    } catch (error) {
        throw new ApiError(400, "Change forget password request failed", [
            "Failed to send change password mail",
        ]);
    }

    res.status(200).json(
        new ApiResponse(200, [], "change password mail sent successfully")
    );
}

async function resetPassword(req, res) {
    const resetPasswordToken = req.query.token;
    const newPassword = req.body.newPassword;

    let user = undefined;

    try {
        user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
        });

        if (!user) {
            throw new ApiError(400, "Password reset failed", [
                "User not found",
            ]);
        }
    } catch (error) {
        throw new ApiError(400, "Password reset failed", ["User not found"]);
    }

    let decoded = undefined;
    try {
        decoded = jwt.verify(
            resetPasswordToken,
            _CONFIG.JWT_FORGET_PASSWORD_TOKEN_SECRET
        );
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(400, "Password reset failed", [
                "Reset password token expired",
            ]);
        }
        throw new ApiError(400, "Password reset failed", [
            "Invalid reset password tok",
        ]);
    }

    if (decoded.userId !== String(user._id)) {
        throw new ApiError(400, "Password reset failed", ["User not found"]);
    }

    try {
        user.$set({ password: newPassword, resetPasswordToken: null });
        await user.save();
    } catch (error) {
        throw new ApiError(400, "Password reset failed", [
            "Failed to save password",
        ]);
    }

    res.status(200).json(
        new ApiResponse(200, [], "Password changed successfully")
    );
}

export {
    registerUser,
    verifyUser,
    loginUser,
    logoutUser,
    resendVerificationMail,
    refreshAccessToken,
    getUserProfile,
    changeCurrentPassword,
    forgetPasswordRequest,
    resetPassword,
};
