import { ApiResponse } from "../utils/ApiResponse";

async function healthChecKUp(req, res, next) {
    res.status(200).json(new ApiResponse(200, [], "Server working fine"));
}
export { healthChecKUp };
