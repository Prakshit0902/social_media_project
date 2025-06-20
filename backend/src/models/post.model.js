import mongoose, { Schema } from 'mongoose';

const postSchema = Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        
        media: [{
            url: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['image', 'video'],
                required: true
            }
        }],
        
        caption: {
            type: String,
            trim: true,
            maxLength: 2200
        },
        mentions: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        hashtags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        likes: {
            type: Number,
            min: 0,
            default: 0
        },
        likedBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        comments: [{
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        
        isArchived: {
            type: Boolean,
            default: false
        },
        savedBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
);


postSchema.index({ owner: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

postSchema.methods.toggleLike = async function(userId) {
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

postSchema.methods.toggleSave = async function(userId) {
    const userIdStr = userId.toString();
    const saveIndex = this.savedBy.findIndex(id => 
        id.toString() === userIdStr
    );
    
    if (saveIndex === -1) {
        this.savedBy.push(userId);
    } else {
        this.savedBy.splice(saveIndex, 1);
    }
    
    return this.save();
};

// Extract hashtags from caption
postSchema.pre('save', function(next) {
    if (this.isModified('caption')) {
        const hashtags = this.caption.match(/#[a-zA-Z0-9_]+/g) || [];
        this.hashtags = [...new Set(hashtags.map(tag => tag.slice(1).toLowerCase()))];
    }
    next();
});

const Post = mongoose.model('Post', postSchema);

export { Post };