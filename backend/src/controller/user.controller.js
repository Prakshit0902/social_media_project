import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { asyncHandler } from '../utils/AsyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    console.log('user registeration started')
    
    const {username,email,password,fullname} = req.body

    if ([username,email,password].some((field) => field.trim() === '')){
        throw new ApiError(400,'All fields are required')
    }

    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }


    const user = await User.create({
        fullname,username,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    if (!createdUser){
        throw new ApiError(500,'Something went wrong while registering user')
    }

    console.log('user registered successfully')
    
    return res.status(200).json(
        new ApiResponse(200,createdUser,'User created successfully')
    )

})

const registerBasicUserDetails = asyncHandler(async (req,res) => {
    const {dob,gender} = req.body

    const profilePictureLocalPath = req.files?.profilePicture[0]?.path

    const pfp = uploadOnCloudinary(profilePictureLocalPath)
    
    const user = await User.findById(req.user._id).select('-password -refreshToken')
    
    user.dob = dob
    user.gender = gender
    user.profilePicture = pfp.url

    await user.save({validateBeforeSave : false})

        return res.status(200).json(
        new ApiResponse(200,user,'DOB and gender Registration completed')
    )

})

const loginUser = asyncHandler(async (req,res) => {
    console.log('logging in user')
    
    const {username,email,password} = req.body
    
    if (!(username || email)){
        throw new ApiError(400,'Email or username is required')
    }

    if (!password){
        throw new ApiError(400,'password is required')
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if (!user){
        throw new ApiError(404,'User not found')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400,'invalid credentials')
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    const options = {
        httpOnly : true,
        secure : true
    }

    console.log('logged in successfully')
    

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset : {
                refreshToken : 1
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changePassword = asyncHandler(async (req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserProfilePicture = asyncHandler(async(req, res) => {
    const profilePictureLocalPath = req.file?.path

    if (!profilePictureLocalPath) {
        throw new ApiError(400, "profile picture file is missing")
    }

    const pfp = await uploadOnCloudinary(profilePictureLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                profilePicture: pfp.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Profile image updated successfully")
    )
})

const updateBio = asyncHandler(async (req,res) => {
    const {bio} = req.body

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                bio : bio
            }
        },{
            new : true
        }
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Bio updated successfully")
    )

})

// const getSavedPosts = asyncHandler(async (req,res) => {
// })

const makeProfileVerified = asyncHandler(async (req,res) => {
    // to be made with the otp verification login
})

const makeProfilePrivateOrPublic = asyncHandler(async (req,res) => {
    const {isPrivate} = req.body

    await User.findByIdAndUpdate(req.user._id,{
        $set : {
            isPrivate : !req.user.isPrivate
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, {isPrivate}, "privacy updated successfully")
    )

})

const getUserProfile = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id)

    const followerCount = user.followers.length
    const followingCount = user.following.length

    const postCount = user.posts.length

    return res.status(200)
    .json(
        new ApiResponse(200,{
            followerCount,
            followingCount,
            postCount
        },'user profile fetched successfully')
    )
})

const followAnUser = asyncHandler(async (req,res) => {
    const {followUserId} = req.body
    let disableFollowButton = false
    if (followUserId === req.user._id.toString()){
        disableFollowButton = true
        return res.status(400).json(
            new ApiResponse(400, { disableFollowButton: true }, "You cannot follow yourself")
        )
    }
    const followUser = await User.findById(followUserId).select('-password -refreshToken')
    const currentUser = await  User.findById(req.user._id)
    let isFollowing = false
    if (!currentUser.following.map(id => id.toString()).includes(followUserId)){
        if (followUser.isPrivate){
            // if (currentUser.followRequests.includes(followUserId)) {
            //     return res.status(400).json(
            //         new ApiResponse(400, {}, "Follow request already sent")
            //     )
            // }
            await User.findByIdAndUpdate(req.user._id,
            {
                $addToSet : {
                    followRequests : followUserId
                }
            },
            {
                new : true
            }
        )

        }
        else {
            await User.findByIdAndUpdate(req.user._id,
                {
                    $push : {
                        following : followUserId
                    }
                },
                {
                    new : true
                }
            )
            await User.findByIdAndUpdate(followUserId,{
                $push : {
                    followers : req.user._id
                    }
                },
                {
                    new : true
                }
        
            )
            isFollowing = true
        }
    }

    let message = isFollowing ? 
    `You started following ${followUser.username}`: 
    followUser.isPrivate ? `Follow request sent to ${followUser.username}`
    : `Already following ${followUser.username}`

    return res.status(200)
    .json(
        new ApiResponse(200,{isFollowing,disableFollowButton},message)
    )
    
})

const unfollowAnUser = asyncHandler(async (req,res) => {
    const {unFollowUserId} = req.body
    const currentUser = await User.findById(req.user._id)
    if (currentUser.following.map(id => id.toString()).includes(unFollowUserId)){
        await User.findByIdAndUpdate(req.user._id,
            {
                $pull : {
                    following : unFollowUserId
                }
            },
            {
                new : true
            })

        await User.findByIdAndUpdate(unFollowUserId,
            {
                $pull : {
                    followers : req.user._id
                }
            },
            {
                new : true
            }
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{},'user unfollowed successfully')
    )
})

const approveFollowRequest = asyncHandler(async (req,res) => {
    const {approveUserId} = req.body

    const currentUser = await User.findByIdAndUpdate(req.user._id,
        {
            $push : {
                followers : approveUserId
            },
            $pull : {
                followRequests : approveUserId
            }
        },
        {
            new : true
        }
    )

    const approveUser = await User.findByIdAndUpdate(approveUserId,
        {
            $push : {
                following : req.user._id
            }
        }
    )

    return res.status(200)
    .json(
        new ApiResponse(200,{},'follow request approved successfully')
    )
    
})


export {registerUser,
    registerBasicUserDetails,
    loginUser,
    logoutUser,
    updateAccountDetails,
    changePassword,
    updateUserProfilePicture,
    getCurrentUser,
    refreshAccessToken,
    updateBio,
    getUserProfile,
    makeProfilePrivateOrPublic,
    makeProfileVerified,
    followAnUser,
    unfollowAnUser,
    approveFollowRequest}