import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const toggleLike = asyncHandler(async (req,res) => {
    console.log('entering the like post ');
    console.log(req.body)
    
    const {postId} = req.body
    if (!postId){
        throw new ApiError(400,'No such post id found')
    }

    const post = await Post.findById(postId)

    if (!post){
        console.log('cannot find such post');
        
        return new ApiError(400,'No such post found')
    }

    const isLiked = post.likedBy.includes(req.user._id)
    
    const updatedPost = await Post.findByIdAndUpdate(postId,
        isLiked ? {
            $pull : {
                likedBy : req.user._id
            },
            $inc : {
                likes : -1
            }
        } : {
            $push : {
                likedBy : req.user._id
            },
            $inc : {
                likes : 1
            }
        }
        ,
        {
            new : true
        }
    )

    await User.findByIdAndUpdate(req.user._id ,
        !isLiked ? 
        {
            $push : {
                likedPosts : updatedPost._id
            } 
        } : 
        {
            $pull : {
                likedPosts : updatedPost._id
            }
        }
    )


    return res.status(200).json(
        new ApiResponse(200,{updatedPost,isLiked}, isLiked ? 'uniked post' : 'liked post')
    )

})

const createPost = asyncHandler(async (req,res) => {
    console.log(req.body);
    
    const {caption,mediaType} = req.body
    const mediaLocalPath = req.file?.path
    let mediaResponse = null

    if (mediaLocalPath){
        mediaResponse = await uploadOnCloudinary(mediaLocalPath)

        if (!mediaResponse) {
            console.error("Cloudinary upload failed try again later");
        }
    }
    else {
        throw new ApiError(500,'Failed to find the media')
    }
    const post = await Post.create({
        owner : req.user?._id,
        media : {
            url : mediaResponse.url,
            type : mediaType
        },
        caption : caption
    })

    const createdPost = await Post.findById(post._id)
    console.log(createdPost);

    return res
        .status(201)
        .json(
            new ApiResponse(201, {
                post: createdPost,
            }, 'Post created successfully')
        );
    
})


export {toggleLike,createPost}