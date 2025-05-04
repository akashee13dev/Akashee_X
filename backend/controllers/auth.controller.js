import {generateTokenAndSetCookie} from "../lib/utils/generateToken.js";
import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async(req, res) => {

    try {
        const {fullName, username, email, password} = req.body;

        //Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({error: "Invalid Email Format"});
        }
        //User Validation
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res
                .status(400)
                .json({error: "User Name Already exists"});
        }
        //Mail Validation
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res
                .status(400)
                .json({error: "Email  Already exists"});
        }
        //Password Validation

        if (password.length < 6) {
            return res
                .status(400)
                .json({error: "Password must be 6 charcter long"});
        }

        //Hash Password before storing
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({fullName, username, email, password: hashPassword});
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            return res
                .status(201)
                .json({newUser});
        } else {
            return res
                .status(400)
                .json({error: "Invalid User Data"});
        }

    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Internal Server Error " + error
            });
    }
};

export const login = async(req, res) => {
    try {

        const {username, password} = req.body;

        // Validation
        const user = await User.findOne({username});
        const checkPassword = await bcrypt.compare(password, user
            ?.password || "");
        if (!user || !checkPassword) {
            return res
                .status(400)
                .json({error: "Invalid Credentials"});
        }
        //Refresh Token
        generateTokenAndSetCookie(user._id, res);
        return res
            .status(200)
            .json({user});

    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Internal Server Error " + error
            });
    }
};

export const logout = async(req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        return res
            .status(200)
            .json({message : "Logout successfully"});

    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Internal Server Error " + error
            });
    }
};


export const getMe = async (req , res)=>{
    try {

        const user = await User.findById(req.user._id);//user variable added in protectRoute
        return res
            .status(200)
            .json({user});

    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Internal Server Error " + error
            });
    }
}