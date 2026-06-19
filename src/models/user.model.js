import mongoose ,{Schema} from "mongoose";

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        index:true,
        trim:true,

    },
    avatar:{
        type:String, //cloudinary url
        requried:true,
    },
    coverImage:{
        type:String, //cloudinary url
    },
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
    }],
    password:{
        type:String,
        required:[true,"please enter the password"]
    },
    refreshToken:{
        type:String,
    },

},{timestamps:true})


export const User=mongoose.model("User",userSchema);