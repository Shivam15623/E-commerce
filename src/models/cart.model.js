import mongoose, { Schema } from "mongoose";



const cartschema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    products:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product"
        },
        productname:{
            type: String,
            required: true,
        },
        charname:{
          type: String,
          required: true,
        },
        size:{
          type: String,
          required: true,
        },
        quantity:{
            type:Number,
            required:true,
        },
        price:{
            type:Number,
            required:true,
        }
    }],
    totalAmount:{
        type:Number,
        required:true,
    },


})


export const Cart=mongoose.model("Cart",cartschema)