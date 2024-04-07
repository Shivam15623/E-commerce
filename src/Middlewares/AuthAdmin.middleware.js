import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const verifyAdminJWT=asyncHandler(async(req,res)=>{
    try {
        req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiErrors(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const admin=Admin.findById(decodedToken?._id).select(
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