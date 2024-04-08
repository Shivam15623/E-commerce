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
    charimg:{
            type:String,
            required:true
    },
    frontimg:{
        type:String,
        required:true
    },
    images:{
        type: [String],
        required: true  // Making size field required
    },
    size: {
        type: [String],
        required: true  // Making size field required
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