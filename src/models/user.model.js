import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const useschema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true //Cloudinary
        },
        address: {
            street: {
                type:String,
                required:true,
            },
            city:  {
                type:String,
                required:true,
            },
            state: {
                type:String,
                required:true,
            },
            country:  {
                type:String,
                required:true,
            },
            pincode:  {
                type:Number,
                required:true,
            },
        },
        password:{
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true
        },
        orders: [{
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }],
        refreshToken:{
            type:String,

        }


    },{
        timestamps:true
    }
)

useschema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }else{
        this.password=bcrypt.hash(this.password,10)
        next()
    }
})

useschema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
useschema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
useschema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id
       
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const User=mongoose.model("User",useschema)