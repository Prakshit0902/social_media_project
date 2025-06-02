import mongoose,{Schema} from "mongoose"


const userSchema = Schema(
    {
        username : {
            type : String,
            required : true,
            lowercase : true,
            trim : true,
            unique : true,
        },
        email : {
            type : String,
            required : true,
            trim : true,
            unique : true,
        },
        fullname : {
            type : String,
            trim : true
        },
        password : {
            type : String,
            required : true
        },
        profilePicture : {
            type : String,
            default : ''
        },
        gender : {
            type : String,
            enum : ['male','female']
        },
        dob : {
            type : Date
        },
        followers : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        following : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        posts : {
            type : Schema.Types.ObjectId,
            ref : 'Post'
        },
        stories : [{
            type : Schema.Types.ObjectId,
            ref : 'Story'
        }],
        isPrivate : {
            type : Boolean,
            default : false
        },
        isVerified : {
            type : Boolean,
            default : false
        },
        bio : {
            type : String,
            max : 500
        },
        savedPosts : [{
            type : Schema.Types.ObjectId,
            ref : 'Post'
        }],
        lastActive : {
            type : Date
        },
        isOnline : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps : true
    }
)

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User',userSchema)

export {User}