import mongoose, {Schema} from "mongoose"

const chatSchema = Schema(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        chatType: {
            type: String,
            enum: ['private', 'group'],
            required: true
        },
        groupName: {  
            type: String,
            trim: true
        },
        groupAdmin: {  
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        groupIcon: {
            type: String,
            default: ''
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        },
        lastMessageAt: {  
            type: Date,
            default: Date.now
        },
        unreadCounts: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            count: {
                type: Number,
                default: 0
            }
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        mutedBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
)

chatSchema.index({ participants: 1 });
chatSchema.index({ createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema)
export {Chat}