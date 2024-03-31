import mongoose, {Schema} from "mongoose";
const ordeSchema=new Schema({
        user:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        products:[{
            product:{
                type:Schema.Types.ObjectId,
                ref:"Product"
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
        status:{
            type:Number,
            required:true,
        }
},{
    timestamps:true
})
export const Order=mongoose.model("Order",ordeSchema);