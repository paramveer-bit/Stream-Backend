import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js" 
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJwt = asyncHandler(async (req,res,next)=>{
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        
        if(!accessToken){
            throw new ApiError(401,"Unauthorized Access")
        }
    
    
        const decodedToken =  jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid Accesstoken id")
        }
    
        req.user = user
        next()
    
    } catch (error) {
        console.log(error)
        throw new ApiError(),"Invalid Accesstoken"
    }
    
})

