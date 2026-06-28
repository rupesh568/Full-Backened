import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { response } from "express";
console.log("everything is not fine")
const userRegister=asyncHandler(async (req,res)=>{

    console.log("everything is fine")
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

    const existeduser=await User.findOne({
        $or:[{ userName },{ email }]
    })
    console.log(existeduser)

    if(existeduser){
        throw new ApiError(409,`${userName} already existed and ${email } also already existed`)
    }

    // const existedUsername=User.findOne({userName})
    // if(existedUsername){
    //     throw new ApiError(409,"username already exists ! enter another one")
    // }


    // const existedEmail=User.findOne({email})
    // if(existedEmail){
    //     throw new ApiError(409,"email already exists enter the new one")
    // }
    console.log(req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath=req.files.coverImage[0].path;

    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is compulsory")
    }

    // if(!coverImageLocalPath){
    //     throw new ApiError(400,"CoverImage is required")
    // }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    /* console.log(avatar) this gives the object which contains alot of information but we just need its url;*/
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    /*if(!coverImage){
        throw new ApiError(400,"CoverImage is required") //see here we are taking coverimage as optional ,so if user doesnot enter it than it should not throw error that is why we have not written throw error.
    }   /*here the avatar is being made by using if condtion ,if there is no avatar than it will throw error to user*/

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage ? coverImage.url : "",
        password,
        userName:userName.toLowerCase(),
        email,

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