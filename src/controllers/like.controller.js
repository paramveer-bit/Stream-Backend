import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";


const toggleVideoLike = asyncHandler (async (req,res)=>{
    const {videoId} = req.params
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const like = await Like.findOne(
        {
            likedBy : req.user.id,
            video : videoId
        }
    )

    if(!like){
        const newLike = await Like.create({likedBy:user.id,video:videoId})
        if(!newLike){
            throw new ApiError(400,"Error While Liking video")
        }
        return res.status(200).json(new ApiResponse(201,newLike,"Video Liked success fully"))
    }

    const removeLike = await Like.findByIdAndDelete(like._id)
    if(!removeLike){
        throw new ApiError(400,"Error while removing like")
    }

    return res.status(200).json(new ApiResponse(200,"Like Remove succesfully"))




})

const toggleCommentLike = asyncHandler (async (req,res)=>{
    const {commentId} = req.params
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const like = await Like.findOne(
        {
            likedBy : req.user.id,
            comment : commentId
        }
    )

    if(!like){
        const newLike = await Like.create({likedBy:user.id,comment:commentId})
        if(!newLike){
            throw new ApiError(400,"Error While Liking Comment")
        }
        return res.status(200).json(new ApiResponse(201,newLike,"Comment Liked success fully"))
    }

    const removeLike = await Like.findByIdAndDelete(like._id)
    if(!removeLike){
        throw new ApiError(400,"Error while removing like")
    }

    return res.status(200).json(new ApiResponse(200,"Like Remove succesfully"))
})

const toggleTweetLike = asyncHandler (async (req,res)=>{
    const {tweetId} = req.params
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id")
    }

    const like = await Like.findOne(
        {
            likedBy : req.user.id,
            tweet : tweetId
        }
    )

    if(!like){
        const newLike = await Like.create({likedBy:user.id,tweet:tweetId})
        if(!newLike){
            throw new ApiError(400,"Error While Liking Tweet")
        }
        return res.status(200).json(new ApiResponse(201,newLike,"Tweet Liked success fully"))
    }

    const removeLike = await Like.findByIdAndDelete(like._id)
    if(!removeLike){
        throw new ApiError(400,"Error while removing like")
    }

    return res.status(200).json(new ApiResponse(200,"Like Remove succesfully"))
})

const getAllUserLike = asyncHandler(async (req,res)=>{

    const user = req.user

    const like =  await Like.aggregate([
        {
            $match :{
                likedBy : new mongoose.Types.ObjectId(user.id)
            }
        },
        {
            $group : {
                _id : "$likedBy",
                videos : {$push : "$video"},
                comments : { $push : "$comment"},
                tweets : {$push : "$tweet"}
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,like,"Liked succesfull fetched"))


})





export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getAllUserLike }
