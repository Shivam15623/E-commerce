import { Admin } from "../models/admin.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"; // Import jwt module

const verifyAdminJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiErrors(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        console.log("Decoded Token:", decodedToken);
        const admin=await Admin.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if(!admin){
            throw new ApiErrors(401,"Invalid AccessToken")
        }
        req.admin=admin
        next()
    } catch (error) {
        throw new ApiErrors(401,"Invalid Access Token")
    }
})
export {verifyAdminJWT}