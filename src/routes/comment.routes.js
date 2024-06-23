import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import {getVideoComments,addComment,updateComment,deleteComment} from "../controllers/comment.controller.js"

const router = Router();


router.get("/:videoId",getVideoComments)

router.post("/add/:videoId",verifyJwt,addComment)

router.patch("/update/:commentId",verifyJwt,updateComment)

router.delete("/delete/:commentId",verifyJwt,deleteComment)




export default router