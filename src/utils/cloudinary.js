import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"


cloudinary.config({ 
    cloud_name: "dnt1q8me7",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        console.log("PAth ids-----"+localFilePath)
        //Uploading
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 60000*2 
        })
        fs.unlinkSync(localFilePath)

        return response;

        
    }
    catch(error){
        //Remove the localy save temp file
        console.log(error)
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteOnCloudinary = async (publicId) =>{
    try{
        if(!publicId) return null
        //Deleting
        const response = await cloudinary.uploader.destroy(publicId)
        return response;
    }
    catch(error){
        console.log(error)
        return null
    }
}
    
export {uploadOnCloudinary,deleteOnCloudinary}

