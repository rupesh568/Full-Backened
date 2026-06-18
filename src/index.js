import mongoose  from "mongoose";

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB();
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