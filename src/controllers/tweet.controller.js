import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const createTweet = asyncHandler(async (req, res) => {
    const {content } = req.body;

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    if(!tweet){
        throw new ApiError(500,"Tweet not created")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,tweet,"Tweet created successfully"))

})

const getUserTweet = asyncHandler(async(req,res)=>{

    const {userId} = req.params

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const tweets = await Tweet.aggregate([

        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup :{
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
        },{
            $addFields : {
                owner : {
                    $first : "$owner"
                }
            }
        }
    ])

    if(!tweets){
        throw new ApiError(404,"Tweets not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"Tweets fetched successfully"))

})

const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    const {content } = req.body
    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    tweet.content = content
    await tweet.save()

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet updated successfully"))


})

const deleteTweet = asyncHandler(async(req,res)=>{

    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,{}, "Tweet deleted successfully"))

})




export {createTweet,getUserTweet,updateTweet,deleteTweet}