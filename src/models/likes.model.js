import mongoose,{Schema} from "mongoose";


const likesSchema=new mongoose.Schema({
    video:[[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }]],
    comment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    tweet:[{
        type:mongoose.Schema.Types.ObjectId,   //if you dont want to create this than you can leave this field
        ref:"Tweet"
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


}
    
    
    ,{timestamps:true})

export const Like=mongoose.model("Like",likesSchema)