import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { response } from "express";
console.log("everything is not fine")
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken=async(userId)=>{
    const user=await User.findById(userId)
    console.log(user)
    const accessToken=await user.generateAccessToken()
    console.log(accessToken)
    const refreshToken=await user.generateRefeshToken()
    console.log(refreshToken)

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}


}


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

const loginUser=asyncHandler(async(req,res)=>{
    //take all the fields required for login :like email,password,username from req.body
    //validataion-check whether user have entered all the required fields

    //check the required fileds matches in the database  or not ;that means check whether the user with this username or email exists or not
    //if the username or email doesnot exists than give an option to register or enter some other email or password
    //if the user exists than 

    //check the password -
    //if it matches give access  - give accesstoken as well so that user can go to anyfiled like their profile,home,post and generate refresh token
    //send cookies
    //if doesnot matches throw error showing incorrect password

    const {userName,email,password}=req.body
    console.log("userName:",userName)
    console.log("password:",password)

    if(!(userName || email)){
        throw new ApiError(400,"username or email is required")
    }

    const userExistence=await User.findOne({
        $or:[{userName},{email}]
    })
    console.log(userExistence)

    if(!userExistence){
        throw new ApiError(400,"userName or email doesnot exist ,please enter the correct one")
    }

    const isPasswordValid=await userExistence.isPasswordCheck(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect password , enter the correct password")
    }
    
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(userExistence._id)


    const loggedUser=await User.findById(userExistence._id).select("-password -refreshToken")


    const option={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedUser,accessToken
            },
            "user logged in successfully"

        )
    )

    



})

const loogedOut=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
            }
        }

    )

    const option={
        httpOnly:true,
        secure:true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"User Logged Out Successfully")
    )

})

const refreshTokenAccess=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies?.refreshToken || req.body?.refreshToken  //see what is happening here is that the browser of computer and mobile phone will send their refresh token from cookie when the accesstoken is at the verge of expiring but the user still want to access the website
    if(!incomingRefreshToken){
        throw new ApiError(401,"Invalid Request as Refresh Token doesnot exist")
    }
    try{
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user=await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired !,Login again")
        }

        const option={
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",refreshToken,option)
        .json(
            new ApiResponse(
               201,
               {
                    accessToken,refreshToken
               },
               "Access Token Refreshed"
            )
        )
    }catch(error){
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }

})


export {userRegister,loginUser,loogedOut,refreshTokenAccess}