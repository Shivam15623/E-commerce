import { Router } from "express";
import { registerUser } from "../Controllers/user.controller.js";
import {upload} from "../Middlewares/multer.middleware.js"
const router=Router()

router.route("/register").post(
    upload.single("avatar"),registerUser)

export default router