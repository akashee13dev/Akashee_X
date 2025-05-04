import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { commentPost, creatPost, deletePost, getFollowingPosts, getLikedPosts, getPosts, getUserPost, likeOrUnLikePost } from "../controllers/post.controller.js";

const router = express.Router();


router.get("/all",protectRoute , getPosts);
router.get("/following",protectRoute , getFollowingPosts);
router.get("/user/:username/all",protectRoute , getUserPost);
router.post("/create",protectRoute , creatPost);
router.delete("/:id",protectRoute , deletePost);
router.get("/likes/:id",protectRoute, getLikedPosts);
router.post("/like/:id",protectRoute, likeOrUnLikePost);
router.post("/comment/:id",protectRoute, commentPost);


export default router;