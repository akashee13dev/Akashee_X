import e from "express";
import {User} from "../models/user.model.js";
import {Notification} from "../models/notification.model.js";
import {v2 as cloudinar} from "cloudinary";

export const getUserProfile = async(req, res) => {
    try {
        const {username} = req.params;
        const user = await User
            .findOne({username})
            .select("-password");
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }
        return res
            .status(200)
            .json({user});
    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const getSuggestedUsers = async(req, res) => {
    try {
        const {id} = req.user.id;
        const followedByMe = await User
            .findById(id)
            .select("following");

        const randomUsers = await User.aggregate([
            {
                $match: {
                    _id: {
                        $ne: id
                    }
                }
            }, {
                $sample: {
                    size: 10
                }
            }
        ]);

        const suggestedUser = randomUsers.filter(user => {
            if (user._id !== id && (followedByMe == null || !followedByMe.following.includes(user._id))) {
                return user;
            };
        })

        suggestedUser.forEach(user => {
            (user.password == null)
        })

        return res
            .status(200)
            .json({suggestedUser});
    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
};

export const followUnFollowUser = async(req, res) => {

    try {
        const {id} = req.params;
        const user = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id == req.user._id) {
            return res
                .status(400)
                .json({error: "Can't follow or unfollow same account"});
        }

        if (!user || !currentUser) {
            return res
                .status(400)
                .json({error: "User Not found for this Operation"});
        }

        const isAlreadyfollowing = currentUser
            .following
            .includes(id);
        if (isAlreadyfollowing) {
            await User.findByIdAndUpdate(id, {
                $pull: {
                    followers: currentUser._id
                }
            });
            await User.findByIdAndUpdate(currentUser._id, {
                $pull: {
                    following: id
                }
            });
            //Notification
            const notifcation = new Notification({type: 'unfollow', from: currentUser._id, to: id});
            await notifcation.save();

            return res
                .status(200)
                .json({message: "User unfollowed successfully"});
        } else {
            await User.findByIdAndUpdate(id, {
                $push: {
                    followers: currentUser._id
                }
            });
            await User.findByIdAndUpdate(currentUser._id, {
                $push: {
                    following: id
                }
            });

            const notifcation = new Notification({type: 'follow', from: currentUser._id, to: id});
            await notifcation.save();

            return res
                .status(200)
                .json({message: "User followed successfully"});
        }

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }

};

export const updateUserProfile = async(req, res) => {

    const {
        fullName,
        email,
        username,
        currentPassword,
        newPassword,
        bio,
        link
    } = req.body;
    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        //Password updating
        if ( (currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res
                .status(400)
                .json({error: "Provide both both and new password"});
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({error: "Invalid Password"});
            }
            if (newPassword.length < 6 || newPassword != currentPassword) {
                return res
                    .status(400)
                    .json({error: "Please give valid Password with min 6 Length"});
            }

            const salt = await bcrypt.salt(newPassword);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        //Image Update
        if (profileImg) { //Cloudnary website to store the images for your application
            if (user.profileImg) {
                await cloudinar
                    .uploader
                    .destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const imgResponse = await cloudinar
                .uploader
                .upload(profileImg);
            profileImg = imgResponse.secure_url;
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinar
                    .uploader
                    .destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const imgResponse = await cloudinar
                .uploader
                .upload(coverImg);
            coverImg = imgResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;
        return res
            .status(200)
            .json({user});

    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }

};
