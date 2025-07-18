const _CONSTANTS = Object.freeze({
    DB_NAME: "Factbot",
    PREFERENCES: {
        THEME: {
            DARK: true,
            LIGHT: false,
        },
        RESPONSE_STYLE: {
            DETAILED: "Detailed - Comprehensive facts with explanations",
            CONSISE: "Consise - Brief and to-the point facts",
            FUN: "Fun - Entertaining and engaging facts",
        },
        NUM_OF_FACTS: {
            SIX: 6,
            SEVEN: 7,
            EIGHT: 8,
        },
        AUTO_SAVE_CONVERSATION: {
            TRUE: true,
            FALSE: false,
        },
        PREFERED_FACT_CATEGORY: {
            SCIENCE: "Science",
            HISTORY: "History",
            TECHNOLOGY: "Technology",
            NATURE: "Nature",
            SPORTS: "Sports",
            ARTS: "Arts",
        },
    },
    ROLE: {
        USER: "user",
        BOT: "bot",
    },
    VERIFICATION_ENDPOINT:
        "http://localhost:3000/factbot/api/v1/user/verify/?token=",
    RESET_PASSWORD_ENDPOINT:
        "http://localhost:3000/factbot/api/v1/user/reset-password/?token=",
});

export default _CONSTANTS;
