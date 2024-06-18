import { Router } from "express";
import { registerUser ,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser} from "../controllers/user.controller.js";
import {upload} from "../middelwares/multer.middelware.js"
import { verifyJwt } from "../middelwares/auth.middelware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routers
router.route("/logout").post(verifyJwt,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/changePassword").post(verifyJwt,changeCurrentPassword)

router.route("/currentUser").post(verifyJwt,getCurrentUser)

export default router