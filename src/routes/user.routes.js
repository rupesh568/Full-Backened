import { Router } from "express";
import { userRegister } from "../controllers/user.controllers.js";
import {upload} from "../middleware/multer.middleware.js"
import { loginUser } from "../controllers/user.controllers.js";
import { loogedOut } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { refreshTokenAccess } from "../controllers/user.controllers.js";
import { changePassword,changeFullNameOrPassword, currentUser,changeCoverImageOrAvatar} from "../controllers/user.controllers.js";
const router=Router()

router.route("/register").post(
    upload.fields([
        {
          name:"avatar",
          maxCount:1,
        },
        {
          name:"coverImage",
          maxCount:1,
        },
    ])
    ,userRegister)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,loogedOut)
router.route("/refresh-token").post(refreshTokenAccess)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/current-user").post(verifyJWT,currentUser)
router.route("/changeFields").post(verifyJWT,changeFullNameOrPassword)
router.route("/changeFiles").post(
  upload.fields([
        {
          name:"avatar",
          maxCount:1,
        },
        {
          name:"coverImage",
          maxCount:1,
        },
    ])
  ,changeCoverImageOrAvatar)


export default router