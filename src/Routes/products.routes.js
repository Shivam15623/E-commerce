import { Router } from "express";
import { upload } from "../Middlewares/multer.middleware.js";
import { CreatenewProduct, UpdateProduct, deleteproduct, getproductDetails, getproducts, updateCharImg, updateFrontImg, updateproductImages } from "../Controllers/products.controller.js";


const router=Router()

router.route("/allproducts").get(getproducts);
router.route("/addproduct").post(upload.fields([{
    name:"charimg",
    maxCount:1
},{
    name:"frontimg",
    maxCount:1
},{
    name: "images",
    maxCount: 10
}]),CreatenewProduct)
router.route("/updateproductcontents/:productId").patch(UpdateProduct);
router.route("/updateproductfrontpage/:productId").patch(upload.single("frontimg"),updateFrontImg)
router.route("/updateproductcharimage/:productId").patch(upload.single("charimg"),updateCharImg)
router.route("/updateproductimages/:productId").patch(upload.array("images",10),updateproductImages)
router.route("/deleteproduct/:productId").delete(deleteproduct)
router.route("/getproductDetails/:productId").get(getproductDetails)
export default router;