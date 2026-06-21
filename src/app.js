import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"16kb"}))  /* when data will come from form like a user enter all his information and submit it than it will reach to the backened database and it will work as middleware*/
app.use(express.urlencoded({extended:true,limit:"16kb"}))  //middleware
app.use(express.static("public"))
app.use(cookieParser())

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration

app.use('/users',userRouter)
//http:localhost:6000/users/register/

export default app;