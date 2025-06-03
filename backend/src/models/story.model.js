import mongoose,{Schema} from 'mongoose'

const storySchema = Schema(
    {
        owner : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        storyContent : {
            type : 'String',
            required : true
        },
        likes : {
            type : Number,
            default : 0,
            min : 0
        },
        likedBy : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        views : {
            type : Number,
            default : 0,
            min : 0
        },
        viewedBy : [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            viewedAt: { 
                type: Date,
                default: Date.now
            }
        }],
        mentions : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        expiresAt : {
            type : Date,
            default : () => new Date.now() + 24*60*60*1000
        },
        isActive : {
            type : Boolean,
            default : true
        }
    },
    {
        timestamps : true
    }
)

storySchema.index({ owner: 1, createdAt: -1 })
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })


const Story = mongoose.model('Story',storySchema)
export {Story}