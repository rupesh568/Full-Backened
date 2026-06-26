import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const userRegister=asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"ok",
        name:"RUPESH KUMAR CHAUDHARY ",

    //get user details from frontened
    //validation-no field should be empty
    //check if user already existed-from username ,password
    //check for images,check for avatar
    //upload images and avatar to cloudinary
    //create user object and placed it into db
    //remove password and refresh token from response
    //check for user creation
    //if user is created send response if not created
    //send error



    })
    const {userName,password,email,fullName}=req.body
    console.log("email:",email)
    console.log("password",password)
    

    if(!fullName || !password || !email || !userName){
        throw new ApiError(400,"All fields are required")
    }

    if(password.length <8){
        throw new ApiError(400,"password is of less character")
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400,"Email is not correct format !")
    }
})

export {userRegister}