import { app } from "./app.js";
import _CONFIG from "./config.js";
import connectDB from "./db/index.js";

const port = _CONFIG.PORT || 3000;

connectDB()
    .then((res) => console.log(`Host: ${res?.connection?.host}`))
    .then(() => {
        app.on("error", (err) => {
            throw err;
        });

        app.listen(port, () => {
            console.log(`Server started listening at PORT: ${port}`);
        });
    })
    .catch((err) => console.error(err));
