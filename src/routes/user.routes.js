import { Router } from "express";
import { registerUser ,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js";
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

router.route("/currentUser").get(verifyJwt,getCurrentUser)

// ----------------------------

router.route("/update-name-email").patch(verifyJwt,updateAccountDetails)

router.route("/update-avatar").patch(
    verifyJwt,
    upload.single('avatar'),    
    updateUserAvatar
)

router.route("/update-cover-image").patch(
    verifyJwt,
    upload.single('coverImage'),
    updateUserCoverImage
)

router.route("/channel-profile/:username").get(getUserChannelProfile)

router.route("/watch-history").get(verifyJwt,getWatchHistory)



export default router