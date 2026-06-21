import { Router } from "express";
import { userRegister } from "../controllers/user.controllers.js";

const router=Router()

router.route("/register").post(userRegister)
router.route("/login").post(login)

export default router