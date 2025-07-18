import { model, Schema } from "mongoose";
import _CONSTANTS from "../constants.js";

const {
    THEME,
    RESPONSE_STYLE,
    NUM_OF_FACTS,
    AUTO_SAVE_CONVERSATION,
    PREFERED_FACT_CATEGORY,
} = _CONSTANTS.PREFERENCES;

const chatPreferenceSchema = new Schema({
    isThemeDark: {
        type: Boolean,
        enum: [THEME.LIGHT, THEME.DARK],
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

const ChatPreference = model("ChatPreference", chatPreferenceSchema);

export default ChatPreference;
