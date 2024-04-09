import {asyncHandler} from "../utils/asynchandler.js"
import {ApiErrors} from "../utils/ApiErrors.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

const mycart=asyncHandler(async(req,res)=>{
    const checkcart=await Cart.findOne({userId:req.user._id});
    if( checkcart.products.length===0){
        return res.status(200).json(new Apiresponse(200,"There is no product in your cart")) 
    }
    return res.status(200).json(new Apiresponse(200,checkcart,"Cart fetched successfully")) 
})
const addtocart = asyncHandler(async (req, res) => {
    const { product } = req.body;

    // Find the product by ID
    const findproduct = await Product.findById(product.productId);
    if (!findproduct) {
        throw new ApiErrors(400, "Invalid product ID");
    }

    // Find the user's cart
    const findcart = await Cart.findOne({ userId: req.user._id });
    if (!findcart) {
        throw new ApiErrors(404, "Cart not found for the user");
    }

    // Check if the specified size is available for the product
    if (!findproduct.size.includes(product.size)) {
        throw new ApiErrors(400, "Invalid product size");
    }

    // Find the index of the existing product in the cart, if any
    const existingProductIndex = findcart.products.findIndex(item => item.productId.equals(product.productId) && item.size === product.size);

    if (existingProductIndex !== -1) {
        // If the product already exists in the cart, update its quantity
        findcart.products[existingProductIndex].quantity += product.quantity;
    } else {
        // If the product is not in the cart, add it
        findcart.products.push({ productId: product.productId, size: product.size, quantity: product.quantity,charname:product.charname,productname:product.productname,price:product.price });
    }

    // Recalculate the total amount for the cart
    const totalAmount = findcart.products.reduce((acc, curr) => {
        // Calculate the total price for each product, considering any discounts
        const totalPrice = curr.price * curr.quantity;
    
        // Check if totalPrice is a valid number, if not, default to 0
        if (!isNaN(totalPrice)) {
            // Add any additional modifiers to the total amount calculation here
            // For example, you could subtract discounts or add taxes
            return acc + totalPrice;
        } else {
            return acc; // Ignore invalid totalPrice
        }
    }, 0);
    console.log(totalAmount)

    // Update the cart with the new products and totalAmount
    const updatedCart = await Cart.findByIdAndUpdate(findcart._id, {
        $set: {
            products: findcart.products,
            totalAmount: totalAmount
        }
    }, { new: true });

    return res.status(200).json(new Apiresponse(200, updatedCart, "Product added to cart"));
});

const removefromcart = asyncHandler(async (req, res) => {
    const { cartItemId } = req.params; // Assuming you receive the productId of the product to be removed

    // Find the user's cart
    const findcart = await Cart.findOne({ userId: req.user._id });
    if (!findcart) {
        throw new ApiErrors(404, "Cart not found for the user");
    }
    console.log(findcart.products);
console.log(findcart.products.map((item)=>{console.log(item._id)}))
    // Find the index of the product in the cart
    const productIndex = findcart.products.findIndex(item => item._id.toString() === cartItemId);

    // If the product is not found in the cart, throw an error
    if (productIndex === -1) {
        throw new ApiErrors(404, "Product not found in the cart");
    }

    // Remove the product from the products array
    findcart.products.splice(productIndex, 1);

    // Recalculate the total amount
    const totalAmount = findcart.products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    // Update the cart with the modified products array and total amount
    const updatedCart = await Cart.findByIdAndUpdate(findcart._id, {
        $set: {
            products: findcart.products,
            totalAmount: totalAmount
        }
    }, { new: true });

    return res.status(200).json(new Apiresponse(200, updatedCart, "Product removed from cart"));
});
// plus cart quantity
// minus cart quantity
const updateCartQuantity = asyncHandler(async (req, res) => {
    const {  quantityChange } = req.body;
    const {cartItemId}=req.params;

    // Find the user's cart
    const findcart = await Cart.findOne({ userId: req.user._id });
    if (!findcart) {
        throw new ApiErrors(404, "Cart not found for the user");
    }

    // Find the index of the product in the cart
    const productIndex = findcart.products.findIndex(item => item._id.toString() === cartItemId );

    // If the product is not found in the cart, throw an error
    if (productIndex === -1) {
        throw new ApiErrors(404, "Product not found in the cart");
    }

    // Adjust the quantity of the product in the cart based on the quantityChange
    findcart.products[productIndex].quantity += quantityChange;

    // If the quantity becomes zero or less, remove the product from the cart
    if (findcart.products[productIndex].quantity <= 0) {
        findcart.products.splice(productIndex, 1);
    }

    // Recalculate the total amount
    const totalAmount = findcart.products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    // Update the cart with the modified products array and total amount
    const updatedCart = await Cart.findByIdAndUpdate(findcart._id, {
        $set: {
            products: findcart.products,
            totalAmount: totalAmount
        }
    }, { new: true });

    return res.status(200).json(new Apiresponse(200, updatedCart, "Cart updated successfully"));
});

export {mycart,addtocart,removefromcart,updateCartQuantity}