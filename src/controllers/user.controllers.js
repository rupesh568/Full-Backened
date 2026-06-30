import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { response } from "express";
console.log("everything is not fine")
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

const changePassword=asyncHandler(async(req,res)=>{
    

    const {oldPassword,newPassword,confirmPassword}=req.body

    const user=await User.findById(req.user?._id)

    const isPasswordValid=await user.isPasswordCheck(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(401,"Wrong old password,enter the correct old password")
    }
    if(!(newPassword===confirmPassword)){
        throw new ApiError(400,"Both pasword must be same")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    
    

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed sucessfully")
    )

})

const currentUser=asyncHandler(async(req,res)=>{
    const currUser=await User.findById(req.user?._id)
    return res
    .status(200)
    .json(
        new ApiResponse(200,currUser,"data fetched successfully")
    )
})

const changeFullNameOrPassword=asyncHandler(async (req,res)=>{
    const {fullName,userName}=req.body
    if(!(fullName || userName)){
        throw new ApiError(400,"username or fullname is required")
    }
    const user=await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(401,"user not found!")
    }
    if(fullName){
        user.fullName=fullName
    }
    if(userName){
        user.userName=userName
    }
    
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Fullname or username is successfully updated")
    )


})


const changeCoverImageOrAvatar=asyncHandler(async(req,res)=>{
    console.log(req.files)
    const avatarLocalPath=req.files?.avatar?.[0]?.path
    
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path

    if(!(avatarLocalPath || coverImageLocalPath)){
        throw new ApiError(401,"At least one field is required")
    }
    const user=await User.findById(req.user?._id).select("-password")
    if(avatarLocalPath){
        const avatar=await uploadOnCloudinary(avatarLocalPath)
        if(!avatar){
            throw new ApiError(401,"Avatar is required")
        }
        user.avatar=avatar.url
        console.log(avatar)
    }
    
    if(coverImageLocalPath){
        const coverImage=await uploadOnCloudinary(coverImageLocalPath)
        if(!coverImage){
            throw new ApiError(401,"cover image is required")
        }
        user.coverImage=coverImage.url

    }
    await user.save({validateBeforeSave:false})
    
    
    



    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar and coverImage are updated successfully")
    )


    
    
     //complete it its main aim is to allow user to change their coverImage or avatar
})

const userChannelProfile=asyncHandler(async(req,res)=>{  //this means we are visiting to another person channel 
    const {username} =req.params            //see this controller is built so that any logged in user on youtube can view other person profile and see everything
    console.log(req.params)
    if(!username?.trim()){
        throw new ApiError(400,"username doesnot exist")
    }

    const channel=await User.aggregate([
        {
            $match:{
                userName:username?.toLowerCase(),
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"              //THIS IS THE TOTAL NUMBER OF MY SUBSCRIBERS; and also here subscribers is the name of the array which will be formed after joining so we will count it ,to calcualte total number of subscriber
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"            //THIS IS THE TOTAL NUMBER OF CHANNELS TO WHOM I HAVE SUBSCRIBED and also subscribeTo is the array which will be formed after joining and we will calculate its size to find the total number of channel subscribed by the user.
            } 

            
        },
        {
            $addFields:{         //see here the addFields has added two more attributes to the User Model that means there will be two more columns with the given name in the database
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedTo:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }

                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                channelSubscribedTo:1,
                isSubscribed:1,
                email:1,
                createdAt:1
                

            }
        }
        
    ])
    if(!channel?.length){
        throw new ApiError(404,"channel doesnot exist")
    }
    console.log(channel)
   //see we always write return that means whenever our controller is created we always send response to the userBrowse,for example:here we have created the system that tells what data will be sent to the user whenever they visit profile but we have just decided not sent it to the user when they go to that url ,so to set it we return it to the user that data than only that will be seen by the user
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"data fetched successfully..")
    )
})
//see one important thing you can set the value of the attributes as well by the help of $set method of mongodb,and using this method:findbyid and update 
//
const watchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id" ,
                            as:"userInformation",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1,
                                        
                                    }
                                }
                            ]
                        }
                    
                    },
                    {
                        $addFields:{
                            userInformation:{
                                $first:"$userInformation"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    )
})


export {userRegister,
    loginUser,
    loogedOut,
    refreshTokenAccess,
    currentUser,
    changePassword,
    changeFullNameOrPassword,
    changeCoverImageOrAvatar,
    userChannelProfile,
    watchHistory
}