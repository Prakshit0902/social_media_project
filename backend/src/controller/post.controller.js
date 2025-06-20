import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

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


export {toggleLike}