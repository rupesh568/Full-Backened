import mongoose,{Schema} from "mongoose";


const playlistSchema=new mongoose.Schema({
    description:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    video:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
 
    }
,{timestamps:true})


