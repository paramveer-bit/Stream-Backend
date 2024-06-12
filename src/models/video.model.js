import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile :{
        type : String,
        require : true,
    },
    thumnail : {
        type : String,
        require : true,
    },
    title : {
        type : String,
        require : true,
    },
    description:{
        type : String,
        require : true,
    },
    duration : {
        type : Number,
        require : true,
    },
    views : {
        type : Number,
        deafult : 0,
    },
    isPublished : {
        type : Boolean,
        deafult : true,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        require : true
    }


},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)

