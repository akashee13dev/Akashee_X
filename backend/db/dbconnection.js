import mongoose from "mongoose";

const connectDB = async () => {
    try{

        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected Successfully : ${connection.connection.host}`);
    }
    catch(err){
        console.error( `Error connection to Mongo DB ${err.message}`);
        process.exit(1);
    }
}


export default connectDB;