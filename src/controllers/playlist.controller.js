import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";


const createPlaylist = asyncHandler (async (req,res)=>{

    const {name,description,videos} = req.body
    if(!(name && description)){
        throw new ApiError(400,"Name and discription both needed")
    }
    if(!videos?.length){
        throw new ApiError(404,"Atleast one video Needed")
    }

    await Promise.all(videos.map(async (id)=>{
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new ApiError(404,`Worng Video id ${id}`)
        }
        const video = await Video.findById(id)
        if(!video){
            throw new ApiError(404,`Video not exist for ${id}`)
        }
    }))

    const playlist = await Playlist.create({description,name,videos,owner : req.user._id})
    console.log(playlist)

    if(!playlist){
        throw new ApiError(400,"Error while creating playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist created successfully"))

})


const getUserPlaylist = asyncHandler (async (req,res)=>{

    const {userId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup :{
                from : "videos",
                localField : "videos",
                foreignField : "_id",
                as : "videos",
                pipeline : [
                    {
                        $project : {
                            createdAt : 0,
                            updatedAt : 0,
                            owner : 0
                        }
                    },
                ]
            }
        }
    ])

    if(!playlist){
        throw new ApiError(400,"Error while fetching playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"PlayList fetched Successfully"))


})

const getPlayListById = asyncHandler (async (req,res)=>{

    const { playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404,"Invalid playListId")
    }

    const playlist =  await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req,res)=>{

    const {playListId,videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playListId)){
        throw new ApiError (404,"Invalid Playlist Id")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404,"Invaid video Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Wrong Video Id")
    }

    const playlist = await Playlist.findById(playListId)

    if(!playlist){
        throw new ApiError("No Playlist Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    playlist.videos.push(videoId)

    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video Added to playlist successfully"))

})


const removeVideoToPlaylist = asyncHandler(async (req,res)=>{

    const {playListId,videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playListId)){
        throw new ApiError (404,"Invalid Playlist Id")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404,"Invaid video Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Wrong Video Id")
    }

    const playlist = await Playlist.findById(playListId)

    if(!playlist){
        throw new ApiError("No Playlist Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    playlist.videos=playlist.videos.filter(item=>item._id!=videoId)
    const updatedPlayList= await playlist.save({ validateBeforeSave: false })

    if(!updatedPlayList){
        throw new ApiError(400,"There was a problem while updating the playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist updated successfully"))

})

const deletePlayList = asyncHandler( async (req,res)=>{
    const { playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404,"Invalid playListId")
    }

    const playlist =  await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    const removed = await Playlist.findByIdAndDelete(playlistId)

    if(!removed){
        throw new ApiError(404,"Error while deleting playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist deleted successfully"))

})

const updatePlaylist = asyncHandler ( async(req,res)=>{

    const {playlistId} = req.params
    const {name,description} = req.body

    if(!(name && description)){
        throw new ApiError(400,"Name and discription both needed")
    }

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404,"Invalid playListId")
    }

    const playlist =  await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    playlist.description = description
    playlist.name = name

    const updatedPlayList = await playlist.save({ validateBeforeSave: false })

    if(!updatedPlayList){
        throw new ApiError(404,"Error while updating")
    }

    return res
    .status(201)
    .json(new ApiResponse(200,updatedPlayList,"Playlist updated successfully"))

})




export {createPlaylist,getUserPlaylist,getPlayListById,addVideoToPlaylist,removeVideoToPlaylist,deletePlayList,updatePlaylist }

