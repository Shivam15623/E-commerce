import mongoose,{Schema } from "mongoose";

const productSchema=new Schema({
    productname:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    stockquantity:{
        type:Number,
        required:true,
    },
    images:{
        charimg:{
            type:String,
            required:true
        },
        productimg:{
            type:String,
            required:true
        }
    },
    animename:{
        type:String,
        required:true
    },
    charname:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


export const Product=mongoose.model("Product",productSchema)