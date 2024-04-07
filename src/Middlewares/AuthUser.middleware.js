import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
 const verifyJWT= asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiErrors(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if(!user){
            throw new ApiErrors(401,"Invalid AccessToken")
        }
        req.user=user
        next()
    } catch (error) {
        throw new ApiErrors(401,"Invalid Access Token")
    }
})
export{verifyJWT}