import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import {toggleVideoLike,toggleCommentLike,toggleTweetLike,getAllUserLike  } from "../controllers/like.controller.js"

const router = Router()


router.route("/v/:videoId").post(verifyJwt,toggleVideoLike);
router.route("/c/:commentId").post(verifyJwt,toggleCommentLike )
router.route("/t/:tweetId").post(verifyJwt,toggleTweetLike )
router.route("/").get(verifyJwt,getAllUserLike)





export default router

