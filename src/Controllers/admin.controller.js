import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import { Admin } from "../models/admin.model.js";
import { Apiresponse } from "../utils/Apiresponse.js";

const GenerateAccessAndRefreshTokenAdmin=async(adminId)=>{
    try {
        const admin=await Admin.findById(adminId);
        const AdminAccesstoken=admin.generateAccessToken();
        const AdminRefreshtoken=admin.generateRefreshToken();
        admin.refreshToken=AdminRefreshtoken;
        await admin.save({validateBeforeSave:false})
        return {AdminAccesstoken,AdminRefreshtoken}
    } catch (error) {
        throw new ApiErrors(500,"someting went wrong while generating refresh token and access token")
    }
}


const registeradmin=asyncHandler(async(req,res)=>{
    //get data from postman
    //validate the data
    // check if user is already registered:username,email
    //create user object-create db entry
    // remove password and refreshtoken from response
    //check for user creation
    //return response
    const {adminname,email,password}=req.body;
    console.log("admin",adminname);
    if([adminname,email,password].some((fields)=>fields?.trim()==="")){
        throw new ApiErrors(400,"All Fields are required");
    }
    const existedadmin=await Admin.findOne({
        $or:[{adminname},{email}]
    })
    if(existedadmin){
        throw new ApiErrors(409,"admin with adminname or email  already exists")
    }
    const admin=await Admin.create({
        adminname,
        email,
        password
    })
    const createdadmin=await Admin.findById(admin._id).select(
        "-password -refreshToken"
    )
    if(!createdadmin){
        throw new ApiErrors(500,"something went wrong while registering admin")
    }
    return res.status(201).json(
        new Apiresponse(200,createdadmin,"admin Registered successfully")
   )

})
const loginadmin=asyncHandler(async(req,res)=>{
    //get data from frontend
    const {adminname,email,password}=req.body;
    //validate
    if(!adminname||!email){
        throw new ApiErrors(400,"adminname or Email is required")
    }
    //find admin
    const admin=await Admin.findOne({
        $or:[{adminname},{email}]
    })
    if(!admin){
        throw new ApiErrors(404,"Admin does not exist")
    }
    //check passwords
    const validatepassword=await admin.isPasswordCorrect(password)
    if(!validatepassword){
        throw new ApiErrors(400,"Wrong Password")
    }
    //generate Access and refreshtoken
    const {AdminAccesstoken,AdminRefreshtoken}=await GenerateAccessAndRefreshTokenAdmin(admin._id)
    const loggedinAdmin=Admin.findById(admin._id).select("-password -refreshToken")
    const options={
        httpsOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",AdminAccesstoken,options).cookie("refreshToken",AdminRefreshtoken,options).json(new Apiresponse(200,{admin:loggedinAdmin,AdminAccesstoken,AdminRefreshtoken},"Admin Logged in Successfully"))


})
const logoutadmin=asyncHandler(async(req,res)=>{
    Admin.findByIdAndUpdate(req.admin._id,{
        $set:refreshToken
    },{
        new:true
    })
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
})
export {registeradmin,loginadmin,logoutadmin}