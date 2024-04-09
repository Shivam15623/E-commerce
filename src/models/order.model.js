import mongoose, {Schema} from "mongoose";
const ordeSchema=new Schema({
    shippingInfo: {
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
    
        state: {
          type: String,
          required: true,
        },
    
        country: {
          type: String,
          required: true,
        },
        pinCode: {
          type: Number,
          required: true,
        },
        phoneno: {
          type: Number,
          required: true,
        },
      },
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },username: {
          type: String,
          required: true // Example: If you want to make username required
        },
        email: {
          type: String,
          required: true // Example: If you want to make email required
        },
        phoneno: {
          type: String,
          required: true // Example: If you want to make phone number required
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
        paymentInfo: {
            id: {
              type: String,
              required: true,
            },
            status: {
              type: String,
              required: true,
            },
        },
        totalAmount:{
            type:Number,
            required:true,
        },
        status:{
            type:String,
            required:true,
        }
},{
    timestamps:true
})
export const Order=mongoose.model("Order",ordeSchema);