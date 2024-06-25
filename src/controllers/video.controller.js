import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary ,deleteOnCloudinary} from "../utils/cloudinary.js";

const uploadvideo = asyncHandler(async(req,res)=>{
    const {description,title} = req.body

    const user = req.user

    if([description,title].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields required. No empty field required")
    }

    const localVideoPath = req.files?.video[0].path
    const localThumbnailPath = req.files?.thumbnail[0].path

    if(!(localVideoPath && localThumbnailPath)){
        throw new ApiError(400,"Please provide video and thumbnail")
    }

    const videoPath = await uploadOnCloudinary(localVideoPath)
    const thumbnailPath = await uploadOnCloudinary(localThumbnailPath)

    if(!(videoPath.url && thumbnailPath.url)){
        throw new ApiError(500,"Error in uploading video or thumbnail")
    }

    const video = await Video.create({
        videoFile : videoPath.url,
        thumnail : thumbnailPath.url,
        title,
        description,
        duration : videoPath.duration,
        owner : user._id
    })

    if(!video){
        throw new ApiError(500,"Error in uploading video")
    }

    return res.status(201).json(new ApiResponse(201,{video},"Video uploaded succesfully"))

})

const getAllVideos = asyncHandler(async (req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId} = req.query

    const exist = await User.exists({_id:userId})

    if(!exist){
        throw new ApiError(404,"Videos of this user not found")
    }

    const videos = await Video.aggregatePaginate(
        Video.find({owner:userId}),
        {
            page,
            limit,
            customLabels : {
                docs : "videos"
            },
            sort : {
                [sortBy] : sortType
            }
        }
    )
    if(!videos){
        throw new ApiError(404,"No videos found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{videos},"Videos fetched successfully"))


})

const getVideoById = asyncHandler(async(req,res)=>{
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"Video id required")
    }

    const video = await Video.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup :{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline :[
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
                owner :{
                    "$first" : "$owner"
                }
            }
        }
    ])

    if(!video?.length){
        throw new ApiError(404,"Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video[0],"Video fetched successfully"))


})


const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Video id required")
    }

    const oldVideo = await Video.findById(videoId)

    if(!oldVideo){
        throw new ApiError(404,"Video not found")
    }

    if(req.user._id.toString() !== oldVideo.owner.toString()){
        throw new ApiError(403,"You are not allowed to update this video")
    }

    const fileLocalPath = req.file.path

    if(!fileLocalPath){
        throw new ApiError(400,"Please provide video file")
    }

    const videoPath = await uploadOnCloudinary(fileLocalPath)

    if(!videoPath.url){
        throw new ApiError(500,"Error in uploading video")
    }

    const video = await Video.findByIdAndUpdate(videoId,{
        videoFile : videoPath.url,
        duration : videoPath.duration
    },{
        new : true
    })

    if(!video){
        throw new ApiError(500,"Error in updating video")
    }

    const oldurl = oldVideo.videoFile
    const publicId = oldurl.split("/").pop().split(".")[0]

    const deleted = await deleteOnCloudinary(publicId)

    return res.status(200).json(new ApiResponse(200,{video},"Video updated successfully"))

})

const updateVideoTitle = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {title,description} = req.body
    if(!videoId){
        throw new ApiError(400,"Video id required")
    }


    if(!(title && description)){
        throw new ApiError(400,"Title and description both are required")
    }

    const oldVideo = await Video.findById(videoId)

    if(!oldVideo){
        throw new ApiError(404,"Video not found")
    }

    if(req.user._id.toString() !== oldVideo.owner.toString()){
        throw new ApiError(403,"You are not allowed to update this video Title and description")
    }

    const video = await Video.findByIdAndUpdate(videoId,{
        title,
        description
    },{
        new : true
    })

    if(!video){
        throw new ApiError(500,"Error in updating video")
    }

    return res.status(200).json(new ApiResponse(200,{video},"Video updated successfully"))

})

const togglePublish = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Video id required")
    }



    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(403,"You are not allowed to update this video publish status")
    }

    const isPublished = !video.isPublished

    const updatedVideo = await Video.findByIdAndUpdate(videoId,{
        isPublished
    },{
        new : true
    })

    if(!updatedVideo){
        throw new ApiError(500,"Error in updating video")
    }

    return res.status(200).json(new ApiResponse(200,{video:updatedVideo},"Video updated successfully"))

})

const deleteVideo = asyncHandler(async(req,res)=>{

    const { videoId} =  req.params
    const user = req.user

    if(!videoId){
        throw new ApiError(400,"Video id required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found i.e videoId incorrect")
    }

    if(user._id.toString() !== video.owner.toString()){
        throw new ApiError(403,"You are not allowed to delete this video")
    }

    const oldurl = video.videoFile
    const publicId = oldurl.split("/").pop().split(".")[0]

    const deleted = await deleteOnCloudinary(publicId)

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new ApiError(500,"Error in deleting video")
    }

    return res.status(200).json(new ApiResponse(200,{video:deletedVideo},"Video deleted successfully"))


})


export {
    uploadvideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    updateVideoTitle,
    togglePublish,
    deleteVideo
}