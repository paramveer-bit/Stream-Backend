import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import {createPlaylist,getUserPlaylist,getPlayListById,addVideoToPlaylist,removeVideoToPlaylist,deletePlayList,updatePlaylist } from "../controllers/playlist.controller.js"

const router = Router()

router.route("/create").post(verifyJwt,createPlaylist)

router.route("/u/:userId").get(getUserPlaylist)

router.route("/p/:playlistId").get(getPlayListById ).delete(verifyJwt,deletePlayList)

router.route("/add/:playListId/:videoId").patch(verifyJwt,addVideoToPlaylist).delete(verifyJwt,removeVideoToPlaylist)

router.route("/update/:playlistId").patch(verifyJwt,updatePlaylist)





export default router


