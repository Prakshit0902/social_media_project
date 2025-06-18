import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleLike = asyncHandler(async (req,res) => {
    const {postId} = req.body
    if (!postId){
        return new ApiError(400,'No such post id found')
    }

    const post = await Post.findById(postId)

    if (!post){
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

    return res.status(200).json(
        new ApiResponse(200,updatedPost, isLiked ? 'Liked post' : 'Unliked post')
    )

})


export {toggleLike}