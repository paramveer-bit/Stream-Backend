// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"

import connectDb from "./db/index.js";

dotenv.config({
    path : './env'
})

connectDb()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running : ${process.env.port}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB IS CONNECTED")
})
