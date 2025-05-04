import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async(req, res, next) => {
    try {

        //Token + Verify + set current user to Request

        const token = req.cookies.jwt; //CookieParser Needed
        if (!token) {
            return res
                .status(401)
                .json({error: "UnAuthorized : No Token Provided"});
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res
                .status(401)
                .json({error: "UnAuthorized : Invalid Token Provided"});
        }

        const user = await User
            .findById(decode.userId)
            .select("-password");
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }
        req.user = user;
        next();

    } catch (error) {
        return res
            .status(500)
            .json({error: "Internal Server Error "+error});
    }
}