import mongoose, {Schema} from "mongoose"

const messageSchema = Schema(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
            index: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video', 'file'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        readBy: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: {
                type: Date,
                default: Date.now
            }
        }],
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent'
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        }
    },
    {
        timestamps: true
    }
)

messageSchema.index({ chatId: 1, createdAt: -1 })

const Message = mongoose.model('Message', messageSchema)
export {Message}