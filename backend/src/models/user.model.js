import mongoose,{Schema} from "mongoose"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
            match: [/.+\@.+\..+/, 'Please fill a valid email address']
        },
        fullname : {
            type : String,
            trim : true
        },
        password : {
            type : String,
            required : [true,'Password is required'],
            minLength : 6
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
        followRequests : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        posts : [{
            type : Schema.Types.ObjectId,
            ref : 'Post'
        }],
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

userSchema.index({ username: 1 })
userSchema.index({ email: 1 })

userSchema.pre('save',async function(next){
    if (!this,isModified('password')) {
        return next()
    }

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id : this.id,
            email : this.email,
            username : this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id : this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESh_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model('User',userSchema)

export {User}