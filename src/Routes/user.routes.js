import { Router } from "express";
import { UpdateAccountDetails, UpdateAvatar, changeUserpassword, getcurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../Controllers/user.controller.js";
import {upload} from "../Middlewares/multer.middleware.js"
import { verifyJWT } from "../Middlewares/AuthUser.middleware.js";
const router=Router()

router.route("/register").post(
    upload.single("avatar"),registerUser)
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/update-account").post(verifyJWT,UpdateAccountDetails)
router.route("/changepassword").post(verifyJWT,changeUserpassword)
router.route("/currentuser").post(verifyJWT,getcurrentUser)
router.route("/avatar").post(verifyJWT,UpdateAvatar)
export default router