import mongoose from "mongoose";
import { DB_name } from "../constant.js";

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MoNgo_URI}/${DB_name}`);
        console.log(`MongoDB connected!! ,DB Host:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb Connection error:",error)
        process.exit(1)
    }

}
export default connectDB;