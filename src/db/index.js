import mongoose from "mongoose";
import _CONFIG from "../config.js";
import _CONSTANTS from "../constants.js";

async function connectDB() {
    const MongoDB_Connection_URI =
        "mongodb://localhost:27017" || _CONFIG.MONGODB_URI;
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
            `${MongoDB_Connection_URI}/${_CONSTANTS.DB_NAME}`
        );

        return connectionInstance;
    } catch (error) {
        throw new Error(`MongoDB connection Failed !!!. ${error.message}`);
    }
}

export default connectDB;
