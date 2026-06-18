import mongoose  from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})
let  PORT=process.env.PORT || 8000
connectDB()
.then((res)=>{
    app.on("Error",(error)=>{
        console.log("Error:",error);
    })
    app.listen(PORT,()=>{
        console.log(`Server is running at port ${PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB CONNECTION FAILED !!",err)

})
/*import express from "express";

const app=express();



(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}`);
        app.on("Error",(err)=>{
            console.log("Error:",err);
            throw err;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening at ${process.env.PORT}`);
        })
    }catch(err){
        console.log("Error:",err);
        throw err;
    }
})()*/