import { Router } from "express";
import { UpdateAccountDetails, UpdateAvatar, changeUserpassword, getcurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../Controllers/user.controller.js";
import {upload} from "../Middlewares/multer.middleware.js"
import { verifyJWT } from "../Middlewares/AuthUser.middleware.js";
import { addtocart, mycart, removefromcart, updateCartQuantity } from "../Controllers/cart.controller.js";
const router=Router()

router.route("/register").post(
    upload.single("avatar"),registerUser)
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/update-account").patch(verifyJWT,UpdateAccountDetails)
router.route("/changepassword").post(verifyJWT,changeUserpassword)
router.route("/currentuser").get(verifyJWT,getcurrentUser)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),UpdateAvatar)
router.route("/mycart").get(verifyJWT,mycart)
router.route("/addtocart").patch(verifyJWT,addtocart)
router.route("/updatecartproductquantity/:cartItemId").patch(verifyJWT,updateCartQuantity)
router.route("/removefromcart/:cartItemId").patch(verifyJWT,removefromcart)

export default router