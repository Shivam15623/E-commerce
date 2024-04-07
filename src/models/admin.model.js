import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";


const adminSchema=new Schema ({
    adminname: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    }, 
    refreshToken: {
        type: String
    }
},{
    timestamps:true
})

adminSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }else{
        this.password=await bcrypt.hash(this.password,10)
        next()
    }
})
adminSchema.methods.generateAccessToken=function(){
    jwt.sign({
        _id:this._id,
        email: this.email,
        username: this.username,
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
adminSchema.methods.generateRefreshToken=function(){
    jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
adminSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
export const Admin=mongoose.model("Admin",adminSchema)