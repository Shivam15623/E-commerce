import { Router } from "express";
import { UpdateAdminDetails, allordersAdmin, changeAdminpassword, getcurrentAdmin, loginadmin, logoutadmin, refreshAdminAccessToken, registeradmin } from "../Controllers/admin.controller.js";
import { verifyAdminJWT } from "../Middlewares/AuthAdmin.middleware.js";

const router=Router();
router.route("/register").post(registeradmin);
router.route("/login").post(loginadmin);

//secured routes
router.route("/logout").post(verifyAdminJWT,logoutadmin)
router.route("/refreshtoken").post(refreshAdminAccessToken)
router.route("/update-account").patch(verifyAdminJWT,UpdateAdminDetails)
router.route("/changepassword").post(verifyAdminJWT,changeAdminpassword)
router.route("/currentuser").get(verifyAdminJWT,getcurrentAdmin)
router.route("/getallorders").get(verifyAdminJWT,allordersAdmin)

export default router;