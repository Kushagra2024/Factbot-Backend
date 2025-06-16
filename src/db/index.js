import mongoose from "mongoose";
import _CONFIG from "../config.js";
import _CONSTANTS from "../constants.js";

async function connectDB() {
    try {
        mongoose.connection.on("connecting", () =>
            console.log("Establishing connection with MongoDB")
        );

        mongoose.connection.on("connected", () =>
            console.log("MongoDB connnected successfully !!!")
        );

        mongoose.connection.on("disconnected", () =>
            console.log("MongoDB disconnected !!!")
        );

        const connectionInstance = await mongoose.connect(
            `${_CONFIG.MONGODB_URI}/${_CONSTANTS.DB_NAME}`
        );

        return connectionInstance;
    } catch (error) {
        throw new Error(`MongoDB connection Failed !!!\nError: ${error}`);
    }
}

export default connectDB;
