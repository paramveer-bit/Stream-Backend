import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import {createTweet,getUserTweet,updateTweet,deleteTweet} from "../controllers/tweet.controller.js";


const router = Router();

router.use(verifyJwt)

router.post("/",createTweet)

router.get("/:userId",getUserTweet)

router.patch("/update/:tweetId",updateTweet)

router.delete("/delete/:tweetId",deleteTweet)









export default router;