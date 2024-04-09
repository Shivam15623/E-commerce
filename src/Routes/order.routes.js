import { Router } from "express";
import { verifyJWT } from "../Middlewares/AuthUser.middleware.js";
import { UpdateOrderStatus, createorder, myorders } from "../Controllers/order.controller.js";
import { verifyAdminJWT } from "../Middlewares/AuthAdmin.middleware.js";

const router=Router();
// secured routes
router.route("/createorder").post(verifyJWT,createorder)
router.route("/updateorderstatus/:orderId").patch(verifyAdminJWT,UpdateOrderStatus)
router.route("/getmyorders").get(verifyJWT,myorders)


export default router