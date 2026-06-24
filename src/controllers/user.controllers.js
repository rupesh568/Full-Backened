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
})

export {userRegister}