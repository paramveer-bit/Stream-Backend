import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const comment = await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match : {
                    video : new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "owner",
                    pipeline : [
                        {
                            $project : {
                                username : 1,
                                fullname : 1,
                                avatar : 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields : {
                    owner : {
                        $first : "$owner"
                    }
                }
            }
        ]),
        {
            page : parseInt(page),
            limit : parseInt(limit),
            sort : {
                createdAt : -1
            }
        }
    )
    if(!comment){
        throw new ApiError(404,"Comments not found")
    }

    return res  
    .status(200)
    .json(new ApiResponse(200,comment,"Comments fetched successfully"))


})


const addComment = asyncHandler(async(req,res)=>{
    const user = req.user
    const {content } = req.body
    const videoId = req.params.videoId

    if(!content){
        throw new ApiError(400,"Content required")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : user._id
    })

    if(!comment){
        throw new ApiError(500,"Comment not created")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment created successfully"))




})

const updateComment = asyncHandler(async(req,res)=>{

    const user = req.user
    const {content} = req.body
    const commentId = req.params.commentId

    if(!content){
        throw new ApiError(400,"Content required")
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== user._id.toString()){
        throw new ApiError(403,"You are not allowed to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,
        {
            content
        },{
            new : true
        }
    )

    if(!updatedComment){
        throw new ApiError(500,"Error in updating comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async(req,res)=>{

    const {commentId} = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Comment deleted successfully"))

})






export {getVideoComments,addComment,updateComment,deleteComment}