import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/profile");
    },

    filename: (req, file, cb) => {
        const uniqueFileName =
            file.originalname.split(".")[0] +
            "-" +
            Date.now() +
            "." +
            file.mimetype.split("/")[1];
        cb(null, uniqueFileName);
    },
});

function fileUploader() {
    const upload = multer({ storage });

    return upload;
}

export default fileUploader;
