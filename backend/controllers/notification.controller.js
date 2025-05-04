import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import {User} from "../models/user.model.js";

export const getNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }

        const notifications = await Notification
            .find({to: user._id})
            .populate({path: "from", select: "username profileImg"});

        if(notifications){
            await Notification.updateMany({to : user._id}, {read : true});
        }

        return res
            .status(200)
            .json({notifications});
    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
}

export const deleteNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }
        await Notification.deleteMany({to : user._id});

        return res
            .status(200)
            .json({message : "deleted successfully"});
    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
}


export const deleteNotification = async(req, res) => {
    try {
        const userId = req.user._id;
        const {id} = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({error: "User Not Found"});
        }
        
        const notification = await Notification.findById(id);
        if(!notification){
            return res
                .status(404)
                .json({error: "Notification Not Found"});
        }

        if(notification.to.toString() !== userId.toString()){
            return res
                .status(401)
                .json({error: "You are not authorized to delete this Notification"});
        }

        await Notification.deleteOne({_id : notification._id});

        return res
            .status(200)
            .json({message : "deleted successfully"});
    } catch (error) {
        return res
            .status(500)
            .json({error: `Internal Server Error ${error}`});
    }
}