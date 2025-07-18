import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import _CONSTANTS from "../constants.js";
import ChatPreference from "../models/userPreference.model.js";

const {
    THEME,
    RESPONSE_STYLE,
    NUM_OF_FACTS,
    AUTO_SAVE_CONVERSATION,
    PREFERED_FACT_CATEGORY,
} = _CONSTANTS.PREFERENCES;

async function getUserSettings(req, res) {
    const userId = req.user;

    let user = undefined;
    try {
        user = await User.findById(userId)?.populate("chatPreference");
    } catch (error) {
        throw new ApiError(400, "Failed to get user settings", [
            "User not found",
        ]);
    }

    if (!user) {
        throw new ApiError(400, "Failed to get user settings", [
            "User not found",
        ]);
    }

    return res.json(
        new ApiResponse(
            200,
            [{ userChatPreferences: user.chatPreference }],
            "fetched user chat preferences successfully"
        )
    );
}

async function resetSettingsToDefault(req, res) {
    const userId = req.user;

    let user = undefined;
    let userChatPreferenceId = undefined;
    try {
        user = await User.findById(userId);
        userChatPreferenceId = user.chatPreference;
    } catch (error) {
        throw new ApiError(400, "Failed to reset user settings", [
            "User not found",
        ]);
    }

    if (!user || !userChatPreferenceId) {
        throw new ApiError(400, "Failed to reset user settings", [
            "User not found",
        ]);
    }

    const defaultUserChatPreferences = {
        theme: THEME.LIGHT,
        responseStyle: RESPONSE_STYLE.DETAILED,
        noOfFacts: NUM_OF_FACTS.SIX,
        autoSaveConversation: AUTO_SAVE_CONVERSATION.TRUE,
        preferredFactCategories: [
            PREFERED_FACT_CATEGORY.SCIENCE,
            PREFERED_FACT_CATEGORY.HISTORY,
            PREFERED_FACT_CATEGORY.TECHNOLOGY,
            PREFERED_FACT_CATEGORY.NATURE,
            PREFERED_FACT_CATEGORY.SPORTS,
            PREFERED_FACT_CATEGORY.ARTS,
        ],
    };

    let savedUserChatPreference = undefined;
    try {
        savedUserChatPreference = await ChatPreference.findByIdAndUpdate(
            userChatPreferenceId,
            defaultUserChatPreferences,
            {
                new: true,
            }
        );
    } catch (error) {
        console.log(error);

        throw new ApiError(400, "Failed to reset user settings", [
            "failed to save user settings",
        ]);
    }

    res.status(200).json(
        new ApiResponse(
            200,
            [savedUserChatPreference],
            "User settings reset successfully"
        )
    );
}

async function updateUserSettings(req, res) {
    const userId = req.user;
    const {
        theme,
        responseStyle,
        noOfFacts,
        autoSaveConversation,
        preferredFactCategories,
    } = req.body;

    const updatedUserChatPreferences = {
        theme: String(theme),
        responseStyle: String(responseStyle),
        noOfFacts: Number(noOfFacts),
        autoSaveConversation: Boolean(autoSaveConversation),
        preferredFactCategories: JSON.parse(preferredFactCategories),
    };

    let user = undefined;
    let userChatPreferenceId = undefined;
    try {
        user = await User.findById(userId);
        userChatPreferenceId = user.chatPreference;
    } catch (error) {
        throw new ApiError(400, "Failed to update user settings", [
            "User not found",
        ]);
    }

    if (!user || !userChatPreferenceId) {
        throw new ApiError(400, "Failed to update user settings", [
            "User not found",
        ]);
    }

    let savedUserChatPreference = undefined;
    try {
        savedUserChatPreference = await ChatPreference.findByIdAndUpdate(
            userChatPreferenceId,
            updatedUserChatPreferences,
            {
                new: true,
            }
        );
    } catch (error) {
        throw new ApiError(400, "Failed to update user settings", [
            "failed to save user settings",
        ]);
    }

    res.status(200).json(
        new ApiResponse(
            200,
            [savedUserChatPreference],
            "User settings updated successfully"
        )
    );
}

export { getUserSettings, resetSettingsToDefault, updateUserSettings };
