import {v2 as cloudinary} from 'cloudinary'
import { ApiError } from './ApiError.js'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath){
            throw new ApiError(404,'Cannot find the file path')
        }

        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: 'auto'
            }
        )

        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }

}

const deleteFromCloudinary = async (cloudinaryUrl) => {
    try {
        if (!cloudinaryUrl){
            console.log('No URL provided to delete');
            return null
        }

        const urlParts = cloudinaryUrl.split('/')
        const uploadIdx = urlParts.indexOf('upload')

        if (uploadIdx === -1){
            console.log('Invalid cloudinary URL');
            return null
        }
        const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension

        const result = await cloudinary.uploader.destroy(publicId, {invalidate : true})
        console.log(result);
        return result
        
    } catch (error) {
        console.log(error);
        
    }
}


export {uploadOnCloudinary,deleteFromCloudinary}