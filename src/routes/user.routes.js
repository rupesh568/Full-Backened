import { Router } from "express";
import { userRegister } from "../controllers/user.controllers.js";
import {upload} from "../middleware/multer.middleware.js"


const router=Router()

router.route("/register").post(userRegister)
export default router