import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name :{
        type : String,
        require : true,
    },
    description : {
        type : String,
        require : true,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        require : true,
    },
    videos : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video",
    }],

})

export const Playlist = mongoose.model("Playlist",playlistSchema)

