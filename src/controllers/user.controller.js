import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import{uploadOnCloudinary} from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";


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
    console.log(avatar)
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



export {registerUser}
