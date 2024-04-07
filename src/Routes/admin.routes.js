import { Router } from "express";
import { loginadmin, logoutadmin, registeradmin } from "../Controllers/admin.controller.js";
import { verifyAdminJWT } from "../Middlewares/AuthAdmin.middleware.js";

const router=Router();
router.route("/register").post(registeradmin);
router.route("/login").post(loginadmin);

//secured routes
router.route("/logout").post(verifyAdminJWT,logoutadmin)
export default router;