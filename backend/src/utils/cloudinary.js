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


export {uploadOnCloudinary}