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
        const salt=await bcrypt.genSalt(10)
        this.password=await bcrypt.hash(this.password,salt)
        next()
    }
})
adminSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email: this.email,
        adminname: this.adminname,
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
adminSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
adminSchema.methods.isPasswordCorrect=async function(password){
    console.log(password)
    return await bcrypt.compare(password,this.password)
}
export const Admin=mongoose.model("Admin",adminSchema)