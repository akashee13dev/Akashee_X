import express from "express"
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectDB from "./db/dbconnection.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json()); 
app.use(express.urlencoded({extended:true}));//For Form Data
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT,()=>{
    console.log("Server is running in the Port "+PORT);
    connectDB();
});


