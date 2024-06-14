import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        //Uploading
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        //File hass been uploaded
        console.log("File got uploaded")
        return response
    }
    catch(error){
        //Remove the localy save temp file
        fs.unlinkSync(localFilePath)
        return null
    }
}
    
export default uploadOnCloudinary