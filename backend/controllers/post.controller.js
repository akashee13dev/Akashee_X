import mongoose from "mongoose";
import {Post} from "../models/post.model.js";
import {User} from "../models/user.model.js";
import {v2 as cloudinar} from "cloudinary";
import {Notification} from "../models/notification.model.js";

export const creatPost = async(req, res) => {

    try {
        const {text, img} = req.body;
        const userId = req
            .user
            ._id
            .toString();

        let user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        if (!text && !img) {
            return res
                .status(404)
                .json({error: "Invalid Post"});
        }
        if (img) {
            const imgResponse = await cloudinar
                .uploader
                .upload(img);
            img = imgResponse.secure_url;
        }
        console.log(userId);
        const newPost = new Post({user: userId, text: text, img: img});

        await newPost.save();
        return res
            .status(200)
            .json({newPost});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }

};

export const getFollowingPosts = async(req, res) => {
    try {

        const userId = req
            .user
            ._id
            .toString();

        let user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        const following = user.following;
        if (!following) {
            return res
                .status(204)
                .json([]);
        }

        console.log(following);

        let posts = await Post
            .find({
            user: {
                $in: user.following
            }
        })
            .sort({createdAt: -1})
            .populate({path: "user", select: "-password"})
            .populate({path: "comments.user", select: "-password"})
            .populate({path: "likes.user", select: "-password"})

        return res
            .status(200)
            .json({posts});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const getUserPost = async(req, res) => {
    try {

        const {username} = req.params;

        let user = await User.findOne({username});
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        let posts = await Post
            .find({user: user._id})
            .sort({createdAt: -1})
            .populate({path: "user", select: "-password"})
            .populate({path: "comments.user", select: "-password"})
            .populate({path: "likes.user", select: "-password"})

        return res
            .status(200)
            .json({posts});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const getPosts = async(req, res) => {
    try {

        const userId = req
            .user
            ._id
            .toString();

        let user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        let posts = await Post
            .find({user: userId})
            .sort({createdAt: -1})
            .populate({path: "user", select: "-password"})
            .populate({path: "comments.user", select: "-password"})
            .populate({path: "likes.user", select: "-password"})

        return res
            .status(200)
            .json({posts});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const deletePost = async(req, res) => {
    try {
        const {id} = req.params;
        const userId = req
            .user
            ._id
            .toString();

        let user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }
        let post = await Post.findById(id);
        if (!post) {
            return res
                .status(404)
                .json({error: "Post Not Found"});
        }

        if (post.user.toString() !== userId) {
            return res
                .status(401)
                .json({error: "You are not allowed to delete this Post"});
        }
        if (post.img) {
            const imageId = post
                .img
                .split("/")
                .pop()
                .split(".")[0];
            await cloudinar
                .uploader
                .destroy(imageId);
        }
        await Post.findOneAndDelete(id);

        return res
            .status(200)
            .json({message: "Post Deleted Successfully"});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const getLikedPosts = async(req, res) => {
    try {

        const {id} = req.params

        let user = await User.findById(id);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        let posts = await Post
            .find({
            _id: {
                $in: user.likedPosts
            }
        })
            .sort({createdAt: -1})
            .populate({path: "user", select: "-password"})
            .populate({path: "comments.user", select: "-password"})
            .populate({path: "likes.user", select: "-password"})

        return res
            .status(200)
            .json({posts});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
}

export const likeOrUnLikePost = async(req, res) => {

    try {
        const {id} = req.params;
        const userId = req
            .user
            ._id
            .toString();

        let user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        let post = await Post.findById(id);
        if (!post) {
            return res
                .status(404)
                .json({error: "Post Not Found"});
        }

        const isAlreadyLiked = post
            .likes
            .includes(userId);

        if (isAlreadyLiked) {
            await Post.findByIdAndUpdate(id, {
                $pull: {
                    likes: user._id
                }
            });
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    likedPosts: id
                }
            })
            return res
                .status(200)
                .json({message: "Post Unliked successfully"});
        } else {
            await Post.findByIdAndUpdate(id, {
                $push: {
                    likes: user._id
                }
            });
            await User.findByIdAndUpdate(userId, {
                $push: {
                    likedPosts: id
                }
            })
            if(userId !==  post.user){
                const notifcation = new Notification({type: 'like', from: user._id, to: post.user});
                await notifcation.save();
            }
            return res
                .status(200)
                .json({message: "Post Liked successfully"});
        }

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const commentPost = async(req, res) => {

    try {
        const {id} = req.params;
        const {text} = req.body;
        const userId = req
            .user
            ._id
            .toString();

        if (!text) {
            return res
                .status(404)
                .json({error: "Invalid Comment"});
        }

        let post = await Post.findById(id);
        if (!post) {
            return res
                .status(404)
                .json({error: "Post Not Found"});
        }

        const comment = {
            text: text,
            user: userId
        };
        post
            .comments
            .push(comment);
        await post.save();

        await post.save();
        return res
            .status(200)
            .json({message: "Comment added "});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }

};
