import express from "express"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import dotenv from "dotenv"
import connectDB from "./db/dbconnection.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary'

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDNARY_CLOUD_NAME,
    api_key:process.env.CLOUDNARY_API_KEY,
    api_secret:process.env.CLOUDNARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT;

app.use(express.json()); 
app.use(express.urlencoded({extended:true}));//For Form Data
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
 
app.listen(PORT,()=>{
    console.log("Server is running in the Port "+PORT);
    connectDB();
});


