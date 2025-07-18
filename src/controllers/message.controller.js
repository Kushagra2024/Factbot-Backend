import Message from "../models/message.model.js";

async function createMessage(sessionId, role, message) {
    try {
        const newMessage = await Message.create({
            sessionId,
            role,
            message,
        });

        return newMessage;
    } catch (error) {
        console.log(`Error while adding message to db. ${error}`);
        throw new Error(`Error while adding message to db. ${error}`);
    }
}

export { createMessage };
