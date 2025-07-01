import { Comment } from "../models/comments.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getCommentsByPostId = asyncHandler(async (req, res) => {
    const { postId } = req.body;    
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // First, get only parent comments (comments without parentComment)
    const parentComments = await Comment.find({ 
        post: postId,
        parentComment: null, // This is the key - only get top-level comments
        isDeleted: false 
    })
    .populate('user', 'username profilePicture fullName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    // Now populate replies for each parent comment
    for (let i = 0; i < parentComments.length; i++) {
        if (parentComments[i].replies && parentComments[i].replies.length > 0) {
            // Populate the replies array with full comment objects
            parentComments[i].replies = await Comment.find({
                _id: { $in: parentComments[i].replies },
                isDeleted: false
            })
            .populate('user', 'username profilePicture fullName')
            .sort({ createdAt: 1 });
        }
    }

    // Count only parent comments for accurate pagination
    const totalComments = await Comment.countDocuments({ 
        post: postId,
        parentComment: null, // Count only parent comments
        isDeleted: false 
    });

    console.log('Parent comments count:', parentComments.length);
    console.log('Total parent comments:', totalComments);

    res.status(200).json(
        new ApiResponse(200, {
            comments: parentComments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalComments / parseInt(limit)),
                totalComments,
                hasNextPage: parseInt(page) * parseInt(limit) < totalComments,
                hasPrevPage: parseInt(page) > 1
            }
        }, 'Comments fetched successfully')
    );
});

const createComment = asyncHandler(async (req,res) => {
    const {postId,content,parentCommentId} = req.body

    if (!postId){
        throw new ApiError(404,'post does not exist')
    }
    if (!content){
        throw new ApiError(404,'Empty content detected')
    }

    const comment = await Comment.create({
        post : postId,
        user : req.user,
        content : content,
        parentComment : parentCommentId || null
    })

    const post = await Post.findByIdAndUpdate(postId,
        {
            $push : {
                comments : comment._id
            }
        }
    )

    console.log('commented');

    return res.status(201).json(
        new ApiResponse(201,comment,'user commented successfully')
    )
    
})

const likeComment = asyncHandler(async (req,res) => {
    const {id,parentCommentId} = req.body
    if (!id){
        throw new ApiError(404,'No such comment exists')
    }

    const comment = await Comment.findByIdAndUpdate(id,
        {
            $push : {
                likedBy : req.user._id
            },
            $set : {
                parentComment : parentCommentId
            }
        },
        {
            new : true
        }
    )
    return res.status(200).json(
        new ApiResponse(200,{},'Comment liked successfully')
    )
})

const editComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length < 10) {
        throw new ApiError(400, 'Comment must be at least 10 characters long');
    }

    const comment = await Comment.findById(id);
    
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'You can only edit your own comments');
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    await comment.populate('user', 'username profilePicture fullName');

    return res.status(200).json(
        new ApiResponse(200, comment, 'Comment updated successfully')
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    // console.log(id);
    

    const comment = await Comment.findById(id);
    
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'You can only delete your own comments');
    }

    // Use soft delete to preserve thread structure
    await comment.softDelete();

    // If it's a reply, remove it from parent's replies array
    if (comment.parentComment) {
        await Comment.findByIdAndUpdate(
            comment.parentComment,
            { $pull: { replies: comment._id } }
        );
    }

    // Remove from post's comments array if it's a top-level comment
    if (!comment.parentComment) {
        await Post.findByIdAndUpdate(
            comment.post,
            { $pull: { comments: comment._id } }
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { id }, 'Comment deleted successfully')
    );
});

const replyToComment = asyncHandler(async (req, res) => {
    const { content, parentCommentId, postId } = req.body;

    if (!content || content.trim().length < 10) {
        throw new ApiError(400, 'Reply must be at least 10 characters long');
    }

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
        throw new ApiError(404, 'Parent comment not found');
    }

    // Create the reply
    const reply = await Comment.create({
        post: postId,
        user: req.user._id,
        content: content.trim(),
        parentComment: parentCommentId
    });

    // Add reply to parent comment's replies array
    await parentComment.addReply(reply._id);

    // Populate user info
    await reply.populate('user', 'username profilePicture fullName');

    return res.status(201).json(
        new ApiResponse(201, reply, 'Reply added successfully')
    );
})

export {
    getCommentsByPostId,
    createComment,
    likeComment,
    editComment,
    deleteComment,
    replyToComment
}