import { model, Schema } from "mongoose";

const chatSessionsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        categories: {
            type: [String],
            default: [],
        },
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message",
                required: true,
            },
        ],
    },
    { timestamps: true }
);

const ChatSession = model("Chat Sessions", chatSessionsSchema);

export default ChatSession;
