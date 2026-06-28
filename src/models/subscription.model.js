import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema({
    
},{timestamps:true})

export const Subscriber=mongoose.model("Subscriber",subscriptionSchema)