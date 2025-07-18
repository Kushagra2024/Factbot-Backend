import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import _CONFIG from "../config.js";

cloudinary.config({
    cloud_name: _CONFIG.CLOUDINARY_CLOUD_NAME,
    api_key: _CONFIG.CLOUDINARY_API_KEY,
    api_secret: _CONFIG.CLOUDINARY_SECRET,
});

async function cloudinaryFileUpload(localFilePath) {
    try {
        if (!localFilePath) {
            throw new Error(
                "File name missing while uploading file to cloudinary"
            );
        }

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            public_id: "Avatar",
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);

        return uploadResult?.url;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        throw error;
    }
}

export default cloudinaryFileUpload;
