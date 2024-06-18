import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import{uploadOnCloudinary} from "../utils/cloudinary.js"
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


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
