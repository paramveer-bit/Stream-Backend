import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Subscription} from "../models/subscription.model.js";
import { pipeline } from "stream";
import { subscribe } from "diagnostics_channel";

const toggleSubscription = asyncHandler(async (req, res) => {

    const user = req.user;
    const {channelId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    if(user.id === channelId){
        throw new ApiError(400,"You can't subscribe to yourself")
    }

    const subscription = await Subscription.findOne({subscriber:user.id,channel:channelId});
    if(!subscription){
        const newSubscription = await Subscription.create({subscriber:user.id,channel:channelId});
        return res
        .status(201)
        .json(new ApiResponse(201,"Subscription created",newSubscription))
    }

    await Subscription.findByIdAndDelete(subscription.id);
    return res
    .status(200)
    .json(new ApiResponse(200,"Subscription removed",null))


})

const getUserSubscribers = asyncHandler(async (req, res) => {

    const user = req.user;

    const subscribers = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(user.id)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriber",
                pipeline : [
                    {
                        $project : {
                            username : 1,
                            fullname : 1,
                            avatar : 1
                        }
                    }
                ]
            },
        },
        {
            $addFields : {
                subscriber : {
                    $arrayElemAt : ["$subscriber",0]
                }
            }
        },
        {
            $project :{
                subscriber : 1,
            }
        }
    ])


    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,"Subscribers fetched"))


})

const getSubscribedChannel = asyncHandler(async (req,res)=>{

    const user = req.user;

    const subscribedChannel = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(user.id)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channel",
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
                channel : {
                    $arrayElemAt : ["$channel",0]
                }
            }
        },
        {
            $project : {
                channel : 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,subscribedChannel,"Subscribed channel fetched"))

})






export {toggleSubscription,getUserSubscribers,getSubscribedChannel}


