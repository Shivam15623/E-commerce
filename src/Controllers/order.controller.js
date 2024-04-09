import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Order } from "../models/order.model.js";
import { status_Delivered, status_Ordered, status_shipped } from "../constant.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";

const updatestock=async(id,quantity)=>{
    const findproduct=await Product.findById(id)
    const qu=findproduct.stockquantity-quantity;
    const product = await Product.findByIdAndUpdate(findproduct._id,{
        $set:{
            stockquantity:qu
        }
    },{new:true});
    console.log(product.stockquantity)
   
}

const createorder=asyncHandler(async(req,res)=>{
    const {products,paymentInfo,shippingInfo}=req.body;
    console.log(req.user._id)
    if(products.length===0){
        throw new ApiErrors(400,"select products to generate order")

    }
    const calculateTotalAmount = (products) => {
        let totalAmount = 0;
        products.forEach((product) => {
            totalAmount += product.quantity * product.price;
        });
        return totalAmount;
    };
    const totalAmount=calculateTotalAmount(products);
    const order=await Order.create({
        userId: req.user._id, // Corrected line
        products: products,
        totalAmount: totalAmount,
        status: status_Ordered,
        shippingInfo:shippingInfo,
        paymentInfo:paymentInfo,
        username:req.user.username,
        email:req.user.email,
        phoneno:req.user.phoneno

    })
    const findOrder=await Order.findById(order._id)
    if(!findOrder){
        throw new ApiErrors(400,"Order not Generated")
    }
    await User.findByIdAndUpdate(req.user._id, {
        $push: { orders: order._id }
    });
    return res.status(201).json(new Apiresponse(200,findOrder,"order generated"))
})
// update Order Status -- Admin
const UpdateOrderStatus=asyncHandler(async(req,res)=>{
    if(!req.admin._id){
        throw new ApiErrors("You are not authorized to change status")
    }
    const {status}=req.body;
    console.log(status)
    
    const findorder=await Order.findById(req.params.orderId);
    if(!findorder){
        throw new ApiErrors(404,"No such Order found")
    }
    if(!status){
        throw new ApiErrors(400,"Please Enter Status")
    }
    if(findorder.status===status_Delivered){
        throw new ApiErrors(400,"Order is already delivered")
    }
    if(status===status_shipped){
    
        findorder.products.forEach(async(productt)=>{
            await updatestock(productt.productId,productt.quantity);
        })
    }
    const order=await Order.findByIdAndUpdate(findorder._id,{
        $set:{
            status:status
        }
    },{new:true})
    if(order.status!==status){
        throw new ApiErrors(500,"Order status not changed because some thing went wrong while saving status")
    }
    return res.status(201).json(new Apiresponse(200,order,"Order status changed successfull"))
})
// get logged in user  Orders
const myorders = asyncHandler(async (req, res) => {
    const findOrders = await Order.find({ userId: req.user._id });
    if (findOrders.length === 0) {
        throw new ApiErrors(400, "There are no orders available for the given user ID");
    }
    return res.status(200).json(new Apiresponse(200, findOrders, "Orders for userId are fetched"));
});

export {createorder,UpdateOrderStatus,myorders}