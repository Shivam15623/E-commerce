import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import {User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import { Cart } from "../models/cart.model.js";

const GenerateAccessAndRefreshToken=async(userId)=>{
    try {
        const user =await User.findById(userId);
        const AccessToken=user.generateAccessToken()
        const RefreshToken=user.generateRefreshToken()
        user.refreshToken=RefreshToken
        await user.save({validateBeforeSave:false})
        return {AccessToken,RefreshToken}
    } catch (error) {
        throw new ApiErrors(500,"someting went wrong while generating refresh token and access token")
    }

}

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
    const {username,fullname,email,password,phoneno,address}=req.body
   console.log(address)
   
    if ([username,fullname,email,password,phoneno].some((field)=>field?.trim()==="")) {
        throw new ApiErrors(400,"All Fields are required");
    }
    const { street, city, state, country, pincode } = address || {};
    if (!street || !city || !state || !country || !pincode) {
        throw new ApiErrors(400, "All Address fields are required");
    }
    const ExistedUser=await User.findOne({
        $or:[{username},{email},{phoneno}]
    })
    if(ExistedUser){
        throw new ApiErrors(409,"User with username or email  already exists")
    }
 console.log(req.file)
    const avatarlocalpath=req.file.path;
   
    if(!avatarlocalpath){
        throw new ApiErrors(409,"Avatar file is required")
    }
    const avatar=await uploadCloudinary(avatarlocalpath)
    if(!avatar){

        throw new ApiErrors(409,"Avatar  is required")
    }
    
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        username:username.toLowerCase(),
        email,
        password,
        phoneno,address
    })
    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createduser){
        throw new ApiErrors(500,"something went wrong while registering user")
    }
    const cart=await Cart.create({
        userId:createduser._id,
        username:createduser.username,
        email:createduser.email,
        products:[],
        totalAmount:0,

    })
    const findcart=await Cart.findById(cart._id)
    if(!findcart){
        throw new ApiErrors(500,"Cart not created")
    }
    return res.status(201).json(
         new Apiresponse(200,createduser,"User Registered successfully")
    )
})
const loginUser=asyncHandler(async(req,res)=>{
    //get data from frontend
    //validate data username,email,password
    //find user
    //password check
    //access and refresh token
    //send in cookies
    //response of success
    const {username,email,password}=req.body;
    console.log(username,password)
    if(!username && !email){
        throw new ApiErrors(400,"Username or Password is required")

    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiErrors(404,"No Such User Found")
    }
    const ispasswordvalid=await user.isPasswordCorrect(password);
    if(!ispasswordvalid){
        throw new ApiErrors(401,"Invalid User Credentials")
    }
    const {AccessToken,RefreshToken}=await GenerateAccessAndRefreshToken(user._id)
    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",AccessToken,options).cookie("refreshToken",RefreshToken,options).json(new Apiresponse(200,{user:loggedInUser,AccessToken,RefreshToken},"User Logged in Successfully"))
})
const logoutUser=asyncHandler(async(req,res)=>{
   
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new Apiresponse(200, {}, "User logged Out"))
  
})
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiErrors(401,"unauthorized request")
    }
   try {
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodedToken?._id);
     if(!user){
         throw new ApiErrors(400,"invalid token")
     }
     if(incomingRefreshToken!==user?.refreshToken){
         throw new ApiErrors(400,"refreshtoken expired or used")
     }
     const options={
         httpOnly:true,
         secure:true
     }
     const {AccessToken,newRefreshToken}=await GenerateAccessAndRefreshToken(user._id)
     return res.status(200).cookie("accessToken",AccessToken,options).cookie("refreshToken",newRefreshToken,options).json(200,{AccessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
   } catch (error) {
        throw new ApiErrors(401,error?.message)
   }

})
const changeUserpassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body;
    const user= await User.findById(req.user._id);
    const passwordvalid=await user.isPasswordCorrect(oldpassword);
    if(!passwordvalid){
        throw new ApiErrors(401,"Invalid old password")
    }
    user.password=newpassword;
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new Apiresponse(200,{},"Password is changed Successfully"))

})
const getcurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new Apiresponse(200,req.user,"User fetched successFully"))
})
const UpdateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email,username,address,phoneno}=req.body;
    if([fullname,email,username,phoneno].some((field)=>field?.trim()==="")){
        throw new ApiErrors(401,"fullname,email,username are required");
    }
    const { street, city, state, country, pincode } = address || {};
    if (!street || !city || !state || !country || !pincode) {
        throw new ApiErrors(400, "All Address fields are required");
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullname:fullname,
            email:email,
            username:username,
            address:address,
            phoneno:phoneno,
        }

    },{new:true}).select("-password")
    return res.status(200).json(new Apiresponse(200,user,"User Details Updated"))

})
const UpdateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalpath=req.file?.path
    if(!avatarLocalpath){
        throw new ApiErrors(400,"Avatar File required")
    }
    const avatar=await uploadCloudinary(avatarLocalpath)
    if(!avatar.url){
        throw new ApiErrors(400,"Error while uploading avatar file ")
    }
    const user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar:avatar.url
        }
        
    },{new:true}).select("-password")
    return res.status(200).json(
        new Apiresponse(200,user,"Avatar Updated Successfully ")
    )

})

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeUserpassword,getcurrentUser,UpdateAccountDetails,UpdateAvatar}