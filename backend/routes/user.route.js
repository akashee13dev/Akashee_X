import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnFollowUser, getSuggestedUsers, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";


const routers = express.Router();


routers.get("/profile/:username",protectRoute , getUserProfile);
routers.get("/suggested" , protectRoute , getSuggestedUsers);
routers.post("/follow/:id" , protectRoute , followUnFollowUser);
routers.post("/update", protectRoute , protectRoute ,  updateUserProfile);

export default routers;