import { model, Schema } from "mongoose";
import _CONSTANTS from "../constants.js";
import bcrypt from "bcrypt";
import ChatPreference from "./userPreference.model.js";

const {
    THEME,
    RESPONSE_STYLE,
    NUM_OF_FACTS,
    AUTO_SAVE_CONVERSATION,
    PREFERED_FACT_CATEGORY,
} = _CONSTANTS.PREFERENCES;

const chatPreferenceSchema = new Schema({
    theme: {
        type: String,
        enum: [THEME.LIGHT, THEME.DARK, THEME.SYSTEM],
        default: THEME.LIGHT,
    },
    responseStyle: {
        type: String,
        required: true,
        default: RESPONSE_STYLE.DETAILED,
        enum: [
            RESPONSE_STYLE.DETAILED,
            RESPONSE_STYLE.CONSISE,
            RESPONSE_STYLE.FUN,
        ],
    },
    noOfFacts: {
        type: Number,
        required: true,
        default: NUM_OF_FACTS.SIX,
        enum: [NUM_OF_FACTS.SIX, NUM_OF_FACTS.SEVEN, NUM_OF_FACTS.EIGHT],
    },
    autoSaveConversation: {
        type: Boolean,
        required: true,
        default: AUTO_SAVE_CONVERSATION.TRUE,
        enum: [AUTO_SAVE_CONVERSATION.TRUE, AUTO_SAVE_CONVERSATION.FALSE],
    },
    preferredFactCategories: {
        type: [String],
        required: true,
        default: [
            PREFERED_FACT_CATEGORY.SCIENCE,
            PREFERED_FACT_CATEGORY.HISTORY,
            PREFERED_FACT_CATEGORY.TECHNOLOGY,
            PREFERED_FACT_CATEGORY.NATURE,
            PREFERED_FACT_CATEGORY.SPORTS,
            PREFERED_FACT_CATEGORY.ARTS,
        ],
        enum: [
            PREFERED_FACT_CATEGORY.SCIENCE,
            PREFERED_FACT_CATEGORY.HISTORY,
            PREFERED_FACT_CATEGORY.TECHNOLOGY,
            PREFERED_FACT_CATEGORY.NATURE,
            PREFERED_FACT_CATEGORY.SPORTS,
            PREFERED_FACT_CATEGORY.ARTS,
        ],
    },
});

const userScehma = new Schema(
    {
        fname: {
            type: String,
            required: true,
        },
        lname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: false,
        },
        refreshToken: {
            type: String,
            default: undefined,
        },
        verificationToken: {
            type: String,
            unique: true,
            default: undefined,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
            default: undefined,
        },
        chatPreference: {
            type: Schema.Types.ObjectId,
            ref: "ChatPreference",
        },
    },
    { timestamps: true }
);

userScehma.pre("save", async function (next) {
    if (this.isNew) {
        const chatPreference = await ChatPreference.create({});
        this.chatPreference = chatPreference._id;
    }
    next();
});

userScehma.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});

userScehma.methods.verifyPassword = async function (userPassword) {
    const matched = await bcrypt.compare(userPassword, this.password);
    return matched;
};

const User = model("User", userScehma);

export default User;
