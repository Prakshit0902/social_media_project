import mongoose, { Schema } from 'mongoose';

const storySchema = Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        
        // Simple media support
        media: {
            url: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['image', 'video'],
                required: true
            }
        },
        
        // Basic content
        caption: {
            type: String,
            maxLength: 500
        },
        
        // Core engagement
        views: {
            type: Number,
            default: 0,
            min: 0
        },
        viewedBy: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        // Basic features
        mentions: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        
        // Story expiration
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24*60*60*1000), // 24 hours
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Basic indexes
storySchema.index({ owner: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete after expiry

// Simple view tracking
storySchema.methods.markAsViewed = async function(userId) {
    const hasViewed = this.viewedBy.some(view => 
        view.user.toString() === userId.toString()
    );
    
    if (!hasViewed) {
        this.viewedBy.push({ user: userId });
        this.views += 1;
        return this.save();
    }
    
    return this;
};

// Get active stories
storySchema.statics.getActiveStories = function(userId) {
    return this.find({
        owner: userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).sort('-createdAt');
};

const Story = mongoose.model('Story', storySchema);

export { Story };