import mongoose, {Schema} from "mongoose"

const commentSchema = Schema(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            index: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        likes: {
            type: Number,
            default: 0,
            min: 0
        },
        likedBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        replies: [{
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        parentComment: {  
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        },
        mentions: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        isEdited: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema)
export {Comment}