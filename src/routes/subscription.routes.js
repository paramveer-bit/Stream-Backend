import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import {toggleSubscription,getUserSubscribers,getSubscribedChannel} from "../controllers/subscription.controller.js";

const router = Router();


router.route("/:channelId").post(verifyJwt,toggleSubscription);

router.route("/subscribers").get(verifyJwt,getUserSubscribers);

router.route("/subscribed").get(verifyJwt,getSubscribedChannel);









export default router;

