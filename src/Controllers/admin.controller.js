import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import { Admin } from "../models/admin.model.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Order } from "../models/order.model.js";

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
    console.log("admin",password)
    //validate
    if(!adminname && !email){
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
    console.log("password",validatepassword)
    if(!validatepassword){
        throw new ApiErrors(400,"Wrong Password")
    }
    //generate Access and refreshtoken
    const {AdminAccesstoken,AdminRefreshtoken}=await GenerateAccessAndRefreshTokenAdmin(admin._id)
    const loggedinAdmin = await Admin.findById(admin._id).select("-password -refreshToken");
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken", AdminAccesstoken, options)
    .cookie("refreshToken", AdminRefreshtoken, options)
    .json(
        new Apiresponse(
            200, 
            {
                admin:loggedinAdmin,AdminAccesstoken,AdminRefreshtoken
            },
            "User logged In Successfully"
        )
    )

})
const logoutadmin=asyncHandler(async(req,res)=>{
    Admin.findByIdAndUpdate(req.admin._id,{
        $unset: {
            refreshToken: 1 // this removes the field from document
        }
    },{
        new:true
    })
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new Apiresponse(200, {}, "User logged Out"))
})
const refreshAdminAccessToken=asyncHandler(async(req,res)=>{
    const incomingAdminRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingAdminRefreshToken){
        throw new ApiErrors(401,"unauthorized request")
    }
   try {
     const decodedToken=jwt.verify(incomingAdminRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const admin=await Admin.findById(decodedToken?._id);
     if(!admin){
         throw new ApiErrors(400,"invalid token")
     }
     if(incomingAdminRefreshToken!==admin?.refreshToken){
         throw new ApiErrors(400,"refreshtoken expired or used")
     }
     const options={
         httpOnly:true,
         secure:true
     }
     const {AdminAccesstoken,newAdminRefreshToken}=await GenerateAccessAndRefreshTokenAdmin(admin._id)
     return res.status(200).cookie("accessToken",AdminAccesstoken,options).cookie("refreshToken",newAdminRefreshToken,options).json(200,{AdminAccesstoken,refreshToken:newAdminRefreshToken},"Access Token Refreshed")
   } catch (error) {
        throw new ApiErrors(401,error?.message)
   }

})

const changeAdminpassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body;
    const admin= await User.findById(req.admin._id);
    const passwordvalid=await admin.isPasswordCorrect(oldpassword);
    if(!passwordvalid){
        throw new ApiErrors(401,"Invalid old password")
    }
    admin.password=newpassword;
    await admin.save({validateBeforeSave:false})
    return res.status(200).json(new Apiresponse(200,{},"Password is changed Successfully"))

})
const getcurrentAdmin=asyncHandler(async(req,res)=>{
    return res.status(200).json(new Apiresponse(200,req.admin,"Admin fetched successFully"))
})
const UpdateAdminDetails=asyncHandler(async(req,res)=>{
    const {email,adminname}=req.body;
    if(!adminname || !email){
        throw new ApiErrors(400, "All fields are required")
    }
    const admin=await Admin.findByIdAndUpdate(req.admin._id,{
        $set:{
            email:email,
            adminname:adminname
        }
    },{new:true}).select("-password")
    return res
    .status(200)
    .json(new Apiresponse(200, admin, "Account details updated successfully"))
})
// get all Orders -- Admin
const allordersAdmin=asyncHandler(async(req,res)=>{
    if(!req.admin._id){
        throw new ApiErrors(400,"This is only allowed to user")
    }
    const orders=await Order.find();
    let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalAmount;
  });
    if(!orders ||orders.length===0){
        return res.status(200).json(new Apiresponse(200,totalAmount,"There are no orders now ")) 
    }
    res.status(200).json(new Apiresponse(200,{totalAmount,orders},"All Orders Fetched Successfully ")) 
    


})
// delete Order -- Admin

export {registeradmin,loginadmin,logoutadmin,refreshAdminAccessToken,changeAdminpassword,getcurrentAdmin,UpdateAdminDetails,allordersAdmin}