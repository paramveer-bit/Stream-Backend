import { timeStamp } from "console";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        require : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email :{
        type : String,
        require : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    fullname : {
        type : String,
        require : true,
        lowercase : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String,
        require : true,
    },
    coverImage : {
        type : String,
    },
    watchHistory : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        }
    ],

    password : {
        type : String,
        require : [true ,'Password is required']
    },
    refreshToken : {
        type: String
    }

},{timestamps:true})


//In below function we didnot use callback as in callback function we donot have any refrence but here we need refence of above object
// Here we have you mongoose pre hooks. Prehooks in mongoose are the hooks that can modifie data befor uploading 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

//Designig custome method like finde one upadte one etc
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
        
            _id : this._id,
            email : this.email,
            username: this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_TIME
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
        
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_TIME
        }
    )
}





export const User  = mongoose.model("User",userSchema)