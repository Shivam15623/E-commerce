import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
const app=express();
app.use(cors({
    origin:process.env.CORS_Origin,
    credentials:true
}));
app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({
    extended:true,limit:"16kb"
}))
app.use(express.static("public"));
app.use(cookieParser())
//routes import
import userrouter from "./Routes/user.routes.js"
import adminrouter from "./Routes/admin.routes.js"
import productsrouter from "./Routes/products.routes.js"
//routes declaration
app.use("/api/v1/users",userrouter)
app.use("/api/v1/admin",adminrouter)
app.use("/api/v1/products",productsrouter)
export {app}