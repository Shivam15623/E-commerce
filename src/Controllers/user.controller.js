import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import {User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js";
const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    // validation -not empty
    // check if user is already registered:username,email
    // check for avatar
    // upload it on cloudinary
    //create user object-create db entry
    // remove password and refreshtoken from response
    //check for user creation
    //return response
    const {username,fullname,email,password,phoneno}=req.body
    console.log("email:",email)

   
    if ([username,fullname,email,password,phoneno].some((field)=>field?.trim()==="")) {
        throw new ApiErrors(400,"All Fields are required");
    }
    const ExistedUser=User.findOne({
        $or:[{username},{email}]
    })
    if(ExistedUser){
        throw new ApiErrors(409,"User with username or email  already exists")
    }

    const avatarlocalpath=req.files?.avatar[0]?.path;
   
    if(!avatarlocalpath){
        throw new ApiErrors(409,"Avatar file is required")
    }
    const avatar=await uploadCloudinary(avatarlocalpath)
    if(!avatar){
        throw new ApiErrors(409,"Avatar file is required")
    }
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        username:username.toLowerCase(),
        email,
        password,
        phoneno
    })
    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createduser){
        throw new ApiErrors(500,"something went wrong while registering user")
    }
    return res.status(201).json(
         new Apiresponse(200,createduser,"User Registered successfully")
    )
})
export {registerUser}