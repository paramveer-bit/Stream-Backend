import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import{uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})


        return {accessToken,refreshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Went wrong while generating token")
    }
}


const registerUser = asyncHandler(async (req,res)=>{
    //get user details also file handeling
    const {username,fullname,email,password} = req.body

    //Validation --not empty
    if([fullname,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields required. No empty field required")
    }

    //User alreay exists from username and email
    const existance = await User.findOne({
        $or : [{email},{username}]
    })

    if(existance){
        throw new ApiError(409,"Email or user already exists")
    }

    // check for images and avatar
    //We get urls of files from request body as we use multer middelware which all add data to the request body

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)){
        coverImageLocalPath = req.files.coverImage[0].path
    }
        // cecking avatar
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is needed loacl file")
    }

    //Upload image on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //check on cloudinary
    if(!avatar){
        if(!avatar){
            throw new ApiError(400,"Avatar is needed")
        } 
    }

    //Creation object from data and images url from cloudinary and uploading it on mongoose

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        email,
        username : username.toLowerCase(),
        password,
        coverImage : coverImage?.url || "" 
    })

    
    //cehck response and remove avtar and password
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -avatar"
    )
    if(!createdUser) {
        throw new ApiError(500,"Somthing went wrong while creating user")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"Successfull Created user")
    )
})

const loginUser = asyncHandler(async (req,res)=>{
    // get login details
    // email or user name
    // find user
    //verify login detail
    // genertae refresh and access token 
    // post refresh token
    // store accesstoken in cookeies
    
    const {email,username,password} = req.body
    console.log(email+"  "+ username)

    if(!username && !email){
        throw new ApiError(400,"Require email or username")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect")
    }


    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true,
        sameSite : "lax",
    }

    res.cookie("accessToken",accessToken,options)
    res.cookie("refreshToken",refreshToken,options)
    return res.status(200).json(new ApiResponse(200,{
        user : loggedInUser,accessToken,refreshToken
    },"User logged in")
)

})

const logoutUser = asyncHandler(async (req,res)=>{
    const user = req.user
    await User.findByIdAndUpdate(user._id,{
        $set : {
            refreshToken:undefined
        }
    })

    const options = {
        httpOnly : true,
        // secure : true,
        sameSite : "lax",
    }

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200,{},"User Loged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken!=user.refreshToken){
            throw new ApiError(401,"Refresh Token is ed or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken},
                "AccessToken Refreshed"
            )
        )
    } catch (error) {
        console.log(error)
        throw ApiError(401,"Error in Decoding")
    }

})

const changeCurrentPassword = asyncHandler(async (req,res)=>{

    const {oldPassword,newPassword} = req.body;

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req,res) => {

    return res
    .status(200)
    .json( new ApiResponse(200,req.user,"Current User exported succesfully"))
})
// --------------------------

const updateAccountDetails = asyncHandler(async => (req,res)=>{
    console.log("Updating -------------------   ")
    const {fullname,email} = req.body

    if(!fullname || !email){
        throw ApiError(400,"All fields required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullname,email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Account Details Updated"))
})

// Write fucnction to delete old avatar from cloudinary
const updateUserAvatar = asyncHandler(async (req,res)=>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const oldurl = req.user?.avatar
    const publicId = oldurl.split("/").pop().split(".")[0]

    const deleted = await deleteOnCloudinary(publicId)

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },{new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Avatar changed Succesfully"))
})


const updateUserCoverImage = asyncHandler(async (req,res)=>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const oldurl = req.user?.coverImage
    if(oldurl){
        const publicId = oldurl.split("/").pop().split(".")[0]

        const deleted = await deleteOnCloudinary(publicId)
    }

    if(!coverImage){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },{new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"CoverImage changed Succesfully"))
})


const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"Username is Invalid")
    }

    const channel = await User.aggregate([
        {
            // THis will find the channel with username i.e channel we are looking for
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            // this is find all the subscribers of the channel
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            // this will find all the channels the channel is subscribed to
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            // this will add field in and also check the user is subscribed to that channel or not
            $addFields : {
                subscriberCount : {
                    $size : "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : {
                            $in : [req.user?._id,"$subscribers.subscriber"]
                        },
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            // This will send particular fields only
            // to send any field set it to one just simple
            $project : {
                fullname : 1,
                username : 1,
                subscriberCount : 1,
                subscribedTo : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email   : 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"Channel Profile exported successfully"))
})

const getWatchHistory = asyncHandler(async (req,res) =>{
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : 'users',
                            localField : 'owner',
                            froeignField : '_id',
                            as : 'owner',
                            // Make some changes and see what happen
                            pipeline : [
                                {
                                    $project : {
                                        fullname : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
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
    ])


    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"Watch History exported successfully"))

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}


