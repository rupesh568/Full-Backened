import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema=new mongoose.Schema({
    videoFile:{
        type:String, //cloudinary url
        required:true,
    },
    title:{
        type:String,
        requied:true,

    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        required:true,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,

    },
    ownership:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})


export const Video=mongoose.model("Video",videoSchema)