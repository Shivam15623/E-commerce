import {v2 as cloudinary} from 'cloudinary';

import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const uploadCloudinary=async (localfilepath)=>{
    try {
        if(!localfilepath){
            return null;
        }
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:'auto'
        })
        // console.log("file is uploaded on cloudinary!!",response.url)
        
        setTimeout(() => {
            try {
                fs.unlinkSync(localfilepath);
                console.log(`Local file ${localfilepath} deleted after upload to Cloudinary.`);
            } catch (error) {
                console.error(`Error deleting local file ${localfilepath}:`, error);
            }
        }, 5000);
        return response;
    } catch (error) {
        fs.unlinkSync(localfilepath)
        return null;
    }
  }
  export {uploadCloudinary}