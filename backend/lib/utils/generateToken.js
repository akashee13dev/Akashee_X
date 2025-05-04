import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId , res) =>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn : '1d'
    });
    res.cookie("jwt",token,{
        maxAge: 1 * 24 * 60 * 60 * 1000, // ms
        httpOnly : true , 
        sameSite : "strict",
        secure :  process.env.ENVIRONMENT !== "development"
    });
};