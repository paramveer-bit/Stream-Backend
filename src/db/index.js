import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDb = async() =>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDb Coneected Succesfully `)
        

    } catch (error) {
        console.log("Error",error)
        process.exit(1)
    }

}

export default connectDb