import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import {uploadCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js";
import { Product } from "../models/product.model.js";

const getproducts=asyncHandler(async(req,res)=>{
   try {
     // get
     const products=await Product.find();
     if(!products){
         throw new ApiErrors(500,"Could not fetch products")
     }
     return res.status(200).json(new Apiresponse(200,products,"Products fetched successfully"))
   } catch (error) {
     throw new ApiErrors(500,"Internal server Errors")
   }
})

const CreatenewProduct=asyncHandler(async(req,res)=>{
    const {productname,description,price,category,stockquantity,animename,charname,size}=req.body;
    
    if([productname,description,price,category,stockquantity,animename,charname].some((fields)=>fields.trim()==="")){
        throw new ApiErrors(400,"All Fields are required");
    }
    console.log(size)
    if (!Array.isArray(size)) {
        throw new ApiErrors(400, "Sizes must be an array");
    }
    const charImagLocalfilepath=req.files?.charimg[0].path;
    if(!charImagLocalfilepath){
        throw new ApiErrors(400,"character image is required")
    }
    const characterimage=await uploadCloudinary(charImagLocalfilepath)
    if(!characterimage){
        throw new ApiErrors(400,"character image is required")
    }
    const frontImageLocalfilepath=req.files?.frontimg[0].path;
    if(!frontImageLocalfilepath){
        throw new ApiErrors(400,"Fontpage image image is required")
    }
    const frontpageimage=await uploadCloudinary(frontImageLocalfilepath)
    if(!frontpageimage){
        throw new ApiErrors(400,"Fontpage image image is required")
    }

    
    if (!req.files?.images || req.files.images.length === 0) {
        throw new ApiErrors(400, "At least one image is required");
    }
    const images = req.files.images;
    const imagesCloudinaryResponses = await Promise.all(images.map(async (image) => {
        const cloudinaryResponse = await uploadCloudinary(image.path);
        return cloudinaryResponse.url;
    }));
    console.log(imagesCloudinaryResponses)
    const product=await Product.create({
        productname,
        price,
        description,
        category,
        stockquantity,
        animename,
        charname,
        size,
        charimg:characterimage.url,
        frontimg:frontpageimage.url,
        images:imagesCloudinaryResponses
        

    })
    const createdproduct=await Product.findById(product._id)
    if(!createdproduct){
        throw new ApiErrors(500,"something went wrong while adding new product")
    }
    return res.status(201).json(
        new Apiresponse(200,createdproduct,"new Product added successfully")
   )
})
const UpdateProduct=asyncHandler(async(req,res)=>{
    const {productname,description,price,category,stockquantity,animename,charname,size}=req.body;
    
    const fields = [productname, description, category, animename, charname];
    if (fields.some(field => typeof field !== 'string' || field.trim() === "")) {
        throw new ApiErrors(400, "All fields except price and stockquantity are required");
    }

    // Check if price and stockquantity are not empty and are valid numbers
    if (!price || isNaN(price) || !stockquantity || isNaN(stockquantity)) {
        throw new ApiErrors(400, "Price and stockquantity must be valid numbers");
    }

    console.log(size)
    if (!Array.isArray(size)) {
        throw new ApiErrors(400, "Sizes must be an array");
    }
    
    //find product
    const findproduct=Product.findById(req.params.productId)
    if(!findproduct){
        throw new ApiErrors(400,"There is no such product")
    }
    console.log(req.params.productId)
    const updatedproduct=await Product.findByIdAndUpdate(req.params.productId,{
        $set:{
            productname,
            price,
            description,
            category,
            stockquantity,
            animename,
            charname,
            size,
        }
    },{new:true})
    return res.status(200).json(new Apiresponse(200,updatedproduct,"Product Content Updated successfully"))
})
const updateCharImg=asyncHandler(async(req,res)=>{
    const charImagLocalfilepath=req.file?.path;
    if(!charImagLocalfilepath){
        throw new ApiErrors(400,"character image is required")
    }
    const characterimage=await uploadCloudinary(charImagLocalfilepath)
    if(!characterimage.url){
        throw new ApiErrors(400,"character image is required")
    }
    const product=await Product.findByIdAndUpdate(req.params.productId,{
        $set:{
            charimg:characterimage.url
        }
    },{new:true})
    return res.status(201).json(new Apiresponse(200,product,"Character Image Updated successfully"))
})

const updateFrontImg=asyncHandler(async(req,res)=>{
    const FrontImagLocalfilepath=req.file?.path;
    if(!FrontImagLocalfilepath){
        throw new ApiErrors(400,"character image is required")
    }
    const Frontpageimage=await uploadCloudinary(FrontImagLocalfilepath)
    if(!Frontpageimage.url){
        throw new ApiErrors(400,"character image is required")
    }
    const product=await Product.findByIdAndUpdate(req.params.productId,{
        $set:{
            frontimg:Frontpageimage.url
        }
    },{new:true})
    return res.status(201).json(new Apiresponse(200,product,"Frontpage Image Updated successfully"))
})
const updateproductImages=asyncHandler(async(req,res)=>{
    if (!req.files?.images || req.files.images.length === 0) {
        throw new ApiErrors(400, "At least one image is required");
    }
    const images = req.files.images;
    const imagesCloudinaryResponses = await Promise.all(images.map(async (image) => {
        const cloudinaryResponse = await uploadCloudinary(image.path);
        return cloudinaryResponse.url;
    }));
    console.log(imagesCloudinaryResponses)
    const product=await Product.findByIdAndUpdate(req.params.productId,{
        $set:{
            images:imagesCloudinaryResponses
        }
    },{new:true})
    return res.status(201).json(new Apiresponse(200,product," Images Updated successfully"))
})

const deleteproduct=asyncHandler(async(req,res)=>{
    const ProductId=req.params.productId;
    const findproduct=await Product.findById(ProductId);
    if(!findproduct){
        throw new ApiErrors(400,"No product found")
    }
    const deletedproduct=await Product.findByIdAndDelete(findproduct._id)
    const isproductdeleted=await Product.findByIdAndDelete(findproduct._id)
    if(isproductdeleted){
        throw new ApiErrors(500,"Product is not deleted successfully because something went wrong")
    }
    return res.status(201).json(new Apiresponse(200,"Product Deleted successfully"))
})
const getproductDetails=asyncHandler(async(req,res,next)=>{
    const ProductId=req.params.productId;
    const findproduct=await Product.findById(ProductId);
    if(!findproduct){
        throw new ApiErrors(400,"No product found")
    }
    return res.status(201).json(new Apiresponse(200,findproduct,"Product Details fetched"))
})
export {getproducts,CreatenewProduct,UpdateProduct,updateFrontImg,updateproductImages,updateCharImg,deleteproduct,getproductDetails}