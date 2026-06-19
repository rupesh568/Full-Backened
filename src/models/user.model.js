import mongoose ,{Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

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

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();

    this.password=bcrypt.hash(this.password,8)
    next()
    
    
})

userSchema.methods.isPasswordCheck=async function (password) {
    return await bcrypt.compare(password,this.password)
    
}

userName.methods.generateAccessToken=async function () {
    return await jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            email:this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userName.methods.generateRefeshToken=async function () {
    return await jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY,
        }
    )
    
}
 

export const User=mongoose.model("User",userSchema);