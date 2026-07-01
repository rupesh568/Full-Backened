import { TokenExpiredError } from "jsonwebtoken";
import mongoose,{mongo, Schema} from "mongoose";

const commentSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    video:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    tweet:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tweet"
        }
    ],
    content:{
        type:String,
        required:true
    }

},
{timestamps:true})


export const Comment=mongoose.model("Comment",commentSchema)