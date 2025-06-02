import mongoose,{Schema} from "mongoose"

const postSchema = Schema(
    {
        owner : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        postType : {
            type : String,
            enum : ['image','video'],
            required : true
        },
        postContent : {
            type : String,
            required : true
        },
        mentions : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        description : {
            type : String,
            trim : true,
            required : true
        },
        hashTags : [{
            type : String,
            trim : true
        }],
        likes : {
            type : Number,
            min : 0,
            default : 0
        },
        comments : {
            type : Schema.Types.ObjectId,
            ref : 'Comment'
        },
        shares : {
            type : Number,
            min : 0,
            default : 0
        },
        likedBy : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        visibility: {
            type: String,
            enum: ['public', 'private', 'followers'],
            default: 'public'
        },
        isArchived : {
            type : Boolean,
            default : false
        },
        saves : {
            type : Number,
            min : 0,
            default : 0
        }
    },
    {
        timestamps : true
    }
)

postSchema.index({ owner: 1, createdAt: -1 })  // 1 - > ascending order and -1 -> for desceding order 
postSchema.index({ hashTags: 1, createdAt: -1 })

const Post = mongoose.model('Post',postSchema)

export {Post}