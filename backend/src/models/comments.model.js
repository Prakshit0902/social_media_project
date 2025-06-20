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
            trim: true,
            maxLength : 1000
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
            ref: 'Comment',
            default : null
        },
        mentions: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
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

commentSchema.methods.toggleLike = async function(userId) {
    const userIdStr = userId.toString();
    const likeIndex = this.likedBy.findIndex(id => 
        id.toString() === userIdStr
    );
    
    if (likeIndex === -1) {
        this.likedBy.push(userId);
    } else {
        this.likedBy.splice(likeIndex, 1);
    }
    
    this.likes = this.likedBy.length;
    return this.save();
};

// Soft delete (preserves comment structure)
commentSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.content = "[deleted]";  // Replace content but keep the comment
    return this.save();
};

commentSchema.methods.addReply = async function(replyId) {
    if (!this.replies.includes(replyId)) {
        this.replies.push(replyId);
        return this.save();
    }
    return this;
};



const Comment = mongoose.model('Comment', commentSchema)
export {Comment}