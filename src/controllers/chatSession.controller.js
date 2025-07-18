import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import getFactsFromGemini from "../utils/GetFactsFromGemini.js";
import ChatSession from "../models/chatSession.model.js";
import { createMessage } from "./message.controller.js";
import Message from "../models/message.model.js";
import _CONFIG from "../config.js";
import _CONSTANTS from "../constants.js";

const { USER, BOT } = _CONSTANTS.ROLE;
// helper functions
async function checkIfCurrentSessionActive(userId) {
    try {
        const currentChatSession = await ChatSession.findOne({ userId })?.sort({
            updatedAt: -1,
        });

        const isActive =
            Boolean(currentChatSession) ||
            Date.now() - currentChatSession?.updatedAt <
                _CONFIG.SESSION_INACTIVE_TIME;

        return isActive ? currentChatSession : null;
    } catch (error) {
        console.log(error);

        throw new ApiError(400, "Failed to retrieve chats", [
            "failed to get session details",
        ]);
    }
}

async function createSession(userId) {
    try {
        const defaultBotMessageId = await Message.create({
            message:
                "Hello, I am Fact Bot. Give me any topic and I'll share 7 fascinating facts about it. What would you like to learn about, today ?",
            role: BOT,
        });

        const currentSession = await ChatSession.create({
            userId,
            categories: [],
            messages: [defaultBotMessageId._id],
        });

        return currentSession;
    } catch (error) {
        console.log(error);

        throw new ApiError(400, "Failed to retrieve chats", [
            "failed to create new session",
        ]);
    }
}

// controllers
async function getCurrentSession(req, res) {
    const userId = req.user || "68698dcbeed469c8b79bcfe1";

    // check if user has any active session or not
    // if not, create a new session with bot default message
    // if yes, show current session messages
    if (!(await checkIfCurrentSessionActive(userId))) {
        // create a new session
        await createSession(userId);
    }

    try {
        const { _id, categories, messages } = await ChatSession.findOne({
            userId,
        })
            ?.sort({
                updatedAt: -1,
            })
            .populate("messages", ["_id", "role", "message"]);

        return res.status(200).json(
            new ApiResponse(
                200,
                [
                    {
                        _id,
                        categories,
                        messages,
                    },
                ],
                "Retreived user current session successfully"
            )
        );
    } catch (error) {
        throw new ApiError(400, "Failed to retrieve chats", [
            "failed to create new session",
        ]);
    }
}

async function addUserQueryToSession(req, res) {
    // get user added to req object by auth middleware
    const userId = req.user;

    const currentChatSession = (await checkIfCurrentSessionActive(userId))
        ? await checkIfCurrentSessionActive(userId)
        : await createSession(userId);

    // get message-body from request body
    const query = req.body.query;

    // add message to db
    const userQuery = await Message.create({ role: USER, message: query });

    currentChatSession.messages.push(userQuery._id);
    await currentChatSession.save();

    // respond with success for user message creation
    res.status(201).json(
        new ApiResponse(201, [userQuery], "message added successfully")
    );
}

async function addBotReplyToSession(req, res) {
    // get user added to req object by auth middleware
    const userId = req.user;

    // if sessionID is present, session continue else create new session
    const currentSession = await checkIfCurrentSessionActive(userId);

    // get message-body from request body
    const query = req.body.query;

    // make api call to gemini api to get facts
    const { Category, Facts } = await getFactsFromGemini(query);

    // add message to db
    const geminiResponse = await Message.create({
        role: BOT,
        message: Facts,
    });

    currentSession.messages.push(geminiResponse._id);

    const isCategoryPresent = currentSession.categories?.includes(Category);

    if (!isCategoryPresent) {
        currentSession.categories.push(Category);
    }

    await currentSession.save();

    // respond with success for bot message creation
    res.status(201).json(
        new ApiResponse(201, [geminiResponse], "message added successfully")
    );
}

async function getUserAllSessions(req, res) {
    const userId = req.user;

    const sessions = await ChatSession.findOne({ userId }).populate({
        path: "messages",
        select: ["_id", "role", "message"],
        skip: 1,
        limit: 1,
    });

    res.status(200).json(
        new ApiResponse(200, [sessions], "Retreived all sessions successfully")
    );
}

async function getSession(req, res) {
    const sessionId = req.query.sessionId;

    const session = await ChatSession.findById(sessionId).populate({
        path: "messages",
        select: ["_id", "role", "message"],
    });

    res.status(200).json(
        new ApiResponse(200, [session], "Retreived session successfully")
    );
}

export {
    getCurrentSession,
    addUserQueryToSession,
    addBotReplyToSession,
    getUserAllSessions,
    getSession,
};

// TO DO
// Handle if user stays on current session page for too long with no activity, and suddenly reloads the page -> should if open new session or continue to current session
