import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { response } from "express";

const userRegister=asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"ok",
    //     name:"RUPESH KUMAR CHAUDHARY ",

    //get user details from frontened
    //validation-no field should be empty
    //check if user already existed-from username ,password
    //check for images,check for avatar
    //upload images and avatar to cloudinary
    //create user object and placed it into db
    //remove password and refresh token from response;
    //check for user creation
    //if user is created send response if not created
    //send error



    // })
    
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

    const existeduser=User.findOne({
        $or:[{ userName },{ email }]
    })
    console.log(existeduser)

    if(existeduser){
        throw new ApiError(409,`${userName} already existed and ${email } also already existed`)
    }

    const existedUsername=User.findOne({userName})
    if(existedUsername){
        throw new ApiError(409,"username already exists ! enter another one")
    }


    const existedEmail=User.findOne({email})
    if(existedEmail){
        throw new ApiError(409,"email already exists enter the new one")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    if(!coverImage){
        throw new ApiError(400,"CoverImage is required")
    }   /*here the avatar is being made by using if condtion ,if there is no avatar than it will throw error to user*/

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url,
        userName,
        password,
        userName:userName.toLowerCase()

    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user!")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user is created successfully !")
    )
})

export {userRegister}