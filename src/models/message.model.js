import { model, Schema } from "mongoose";
import _CONSTANTS from "../constants.js";

const { USER, BOT } = _CONSTANTS.ROLE;
const messageSchema = new Schema(
    {
        role: {
            type: String,
            enum: [USER, BOT],
        },
        message: {
            type: [String],
            required: true,
        },
    },
    { timestamps: true }
);

const Message = model("Message", messageSchema);

export default Message;
