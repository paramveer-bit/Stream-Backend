import { Router } from "express";
import { upload } from "../middelwares/multer.middelware.js";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import { uploadvideo,getAllVideos,getVideoById,updateVideo,updateVideoTitle,togglePublish,deleteVideo } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJwt);

router.route("/upload").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadvideo
)

router.route("/").get(getAllVideos)

router.route("/:videoId").get(getVideoById)

router.route("/update/:videoId").patch(
    upload.single("video"),
    updateVideo
)

router.route("/update/title/:videoId").patch(updateVideoTitle)

router.route("/update/publish/:videoId").patch(togglePublish)

router.route("/delete/:videoId").delete(deleteVideo)

export default router;