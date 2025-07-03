import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { asyncHandler } from '../utils/AsyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Post } from '../models/post.model.js'


const optionsRefresh = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',  // Add this
    path: '/',        // Add this
    maxAge: 10 * 24 * 60 * 60 * 1000
}

const options = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',  // Add this
    path: '/',        // Add this
    maxAge: 1 * 24 * 60 * 60 * 1000 
}


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // console.log(refreshToken,'ref',accessToken,'acc');
        

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    console.log('user registration started');
    
    const { email, password, fullname } = req.body;
    
    if ([email, password, fullname].some((field) => !field?.trim())) {
        throw new ApiError(400, 'All fields are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existedUser = await User.findOne({ email: normalizedEmail });
    
    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const user = await User.create({
        fullname: fullname.trim(),
        email: normalizedEmail,
        password
    })


    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });


    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    console.log('user registered successfully');
    
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, optionsRefresh)
        .json(
            new ApiResponse(201, {
                user: createdUser,
                accessToken,
                refreshToken
            }, 'User created successfully')
        );
})

const registerBasicUserDetails = asyncHandler(async (req,res) => {
    console.log('got the req.body as ',req.body)
    const {dob,gender,username} = req.body
    
    const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path
    let pfpResponse = null

    if (profilePictureLocalPath) {
        pfpResponse = await uploadOnCloudinary(profilePictureLocalPath);

        if (!pfpResponse) {
            console.error("Cloudinary upload failed, but proceeding without profile picture.");
        }
    }
    
    const user = await User.findById(req.user._id).select('-password -refreshToken')
    
    user.dob = dob
    user.gender = gender
    user.username = username

    if (pfpResponse && pfpResponse.url) {
        user.profilePicture = pfpResponse.url;
    }

    await user.save({validateBeforeSave : false})

        return res.status(200).json(
        new ApiResponse(200,user,'DOB and gender Registration completed')
    )

})

const loginUser = asyncHandler(async (req,res) => {
    console.log('logging in user')
    
    const {identifier,password} = req.body
    console.log(req.body)
    
    if (!password){
        throw new ApiError(400,'password is required')
    }
    
    if (!identifier){
        throw new ApiError(400,'email or username is required')
    }
    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    })

    if (!user){
        throw new ApiError(404,'User not found')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        console.log('invalid pass');
        
        throw new ApiError(400,'invalid credentials')
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    console.log('logged in successfully')
    

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, optionsRefresh)
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
    console.log('logging out ');
    
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
    console.log('hitting the refresh access token');
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    // console.log(incomingRefreshToken,'incomingRefreshToken');
    

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id).select("-password")
        
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if (incomingRefreshToken?.toString() !== user?.refreshToken?.toString()) {            
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
        
        // Get updated user data (without sensitive fields)
        const updatedUser = await User.findById(user._id).select("-password -refreshToken")
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, optionsRefresh)
        .json(
            new ApiResponse(
                200, 
                updatedUser, // Return user data instead of tokens
                "Access token refreshed and user data fetched"
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
    console.log('getting current user ')
    console.log(req.cookies)
    
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

const updatePersonalDetails = asyncHandler(async (req,res) => {
    const {dob,gender} = req.body

    if (!dob && !gender){
        throw new ApiError('400','No details provided')
    }

    let fieldsToUpdate = {}
    if (dob){
        fieldsToUpdate.dob = dob
    }
    if (gender){
        fieldsToUpdate.gender = gender
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : fieldsToUpdate
        },
        {
            new : true
        }
    ).select('-password -refreshToken')


    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Personal details updated successfully"))
})

// const getSavedPosts = asyncHandler(async (req,res) => {
// })

const makeProfileVerified = asyncHandler(async (req,res) => {
    // to be made with the otp verification login
})

const makeProfilePrivateOrPublic = asyncHandler(async (req,res) => {
    const {isPrivate} = req.body

    const currentUser = await User.findByIdAndUpdate(req.user._id,{
        $set : {
            isPrivate : !req.user.isPrivate
        }
    },
    {
        new : true
    }
).select('-password -refreshToken')

    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {isPrivate,currentUser}, "privacy updated successfully")
    )

})


const getUserProfile = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    // We need to convert the identifier to a valid ObjectId if possible for the $match stage
    const matchCondition = mongoose.Types.ObjectId.isValid(identifier)
        ? { $or: [{ _id: new mongoose.Types.ObjectId(identifier) }, { username: identifier.toLowerCase() }] }
        : { username: identifier.toLowerCase() };
    
    // Aggregation pipeline is an array of stages
    const pipeline = [
        // STEP 1: Find the correct user, equivalent to findOne()
        {
            $match: matchCondition
        },
        // STEP 2: Join with the 'posts' collection, equivalent to populate()
        {
            $lookup: {
                from: "posts", // The actual name of the collection in MongoDB (usually plural and lowercase)
                localField: "posts",
                foreignField: "_id",
                as: "posts", // The name for the array of populated posts
                pipeline: [
                    { 
                        $project: 
                            { 
                                _id: 1,
                                media: 1,
                                likes: 1,
                                commentsCount : {$size : {$ifNull : ["$comments",[]]}}
                            }
                     }]
            }
        },
        {
            $lookup : {
                from : 'users',
                localField : 'followers',
                foreignField : '_id',
                as: 'followers',
                pipeline : [
                    {
                        $project : {
                            _id : 1,
                            username : 1,
                            profilePicture : 1,
                            fullname : 1
                        }
                    }
                ]

            }
        },
        {
            $lookup : {
                from : 'users',
                localField : 'following',
                foreignField : '_id',
                as: 'following',
                pipeline : [
                    {
                        $project : {
                            _id : 1,
                            username : 1,
                            profilePicture : 1,
                            fullname : 1
                        }
                    }
                ]

            }
        },
        {
            $lookup : {
                from : 'users',
                localField : 'followRequestsReceived',
                foreignField : '_id',
                as: 'followRequestsReceived',
                pipeline : [
                    {
                        $project : {
                            _id : 1,
                            username : 1,
                            profilePicture : 1,
                            fullname : 1
                        }
                    }
                ]

            }
        },
        // STEP 3: Add calculated fields to the document
        {
            $addFields: {
                followerCount: { $size: { $ifNull: ["$followers", []] } }, // Safely get array size
                followingCount: { $size: { $ifNull: ["$following", []] } },
                postCount: { $size: { $ifNull: ["$posts", []] } },
                
                // Sort the populated posts within the aggregation
                posts: {
                    $sortArray: {
                        input: "$posts",
                        sortBy: { createdAt: -1 }
                    }
                }
            }
        },
        // STEP 4: Shape the final output, equivalent to select()
        {
            $project: {
                // Exclude sensitive fields
                password: 0,
                refreshToken: 0,
                // You can also explicitly set which fields to keep:
                // username: 1, email: 1, fullname: 1, etc.
            }
        }
    ];

    const results = await User.aggregate(pipeline);
    
    // Aggregation always returns an array, so we need to get the first element
    const user = results[0];

    if (!user) {
        throw new ApiError(404, 'User not found with that identifier');
    }

    // The 'isOwner' check still needs to be done here in the application logic
    // as it depends on the `req` object.
    let isOwner = false;
    if (req.user && user._id.toString() === req.user._id.toString()) {
        isOwner = true;
    }

    // The posts are already populated and sorted by the pipeline!
    return res.status(200).json(
        new ApiResponse(200, { user, isOwner }, 'User profile fetched successfully')
    );
});

const getUserProfilesById = asyncHandler(async (req,res) => {
    console.log('getting user profile by id ')
    
    const {ids} = req.body
    const users = await User.find(
        {
            _id : {
                $in : ids
            }
        }
    ).select('username profilePicture')

    if (!users){
        console.log('error');
        
        throw new ApiError(400,'Cant find user')
    }

    // console.log(users)
    

    return res.status(200)
    .json(
        new ApiResponse(200,{
            users
        },'user profiles fetched successfully')
    )

})


const followAnUser = asyncHandler(async (req, res) => {
    const { followUserId } = req.body;
    const currentUserId = req.user._id;

    if (followUserId === currentUserId.toString()) {
        return res.status(400).json(new ApiResponse(400, {}, "You cannot follow yourself"));
    }

    const followUser = await User.findById(followUserId);
    if (!followUser) {
        throw new ApiError(404, "User to follow not found");
    }

    // Check if a follow request was already sent
    const isRequestSent = req.user.followRequestsSent.includes(followUserId);

    if (isRequestSent) {
        // --- WITHDRAW FOLLOW REQUEST ---
        await User.findByIdAndUpdate(followUserId, { $pull: { followRequestsReceived: currentUserId } });
        const updatedCurrentUser = await User.findByIdAndUpdate(currentUserId, { $pull: { followRequestsSent: followUserId } }, { new: true });

        return res.status(200).json(
            new ApiResponse(200, {
                status: 'withdrawn', // Clear status for the frontend
                currentUser: updatedCurrentUser
            }, "Follow request withdrawn successfully")
        );
    }

    if (followUser.isPrivate) {
        // --- SEND FOLLOW REQUEST ---
        await User.findByIdAndUpdate(followUserId, { $addToSet: { followRequestsReceived: currentUserId } });
        const updatedCurrentUser = await User.findByIdAndUpdate(currentUserId, { $addToSet: { followRequestsSent: followUserId } }, { new: true });

        return res.status(200).json(
            new ApiResponse(200, {
                status: 'requested', // Clear status
                currentUser: updatedCurrentUser
            }, `Follow request sent to ${followUser.username}`)
        );
    } else {
        // --- FOLLOW PUBLIC USER ---
        await User.findByIdAndUpdate(followUserId, { $addToSet: { followers: currentUserId } });
        const updatedCurrentUser = await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: followUserId } }, { new: true });
        
        return res.status(200).json(
            new ApiResponse(200, {
                status: 'following', // Clear status
                currentUser: updatedCurrentUser
            }, `You started following ${followUser.username}`)
        );
    }
});

const unfollowAnUser = asyncHandler(async (req, res) => {
    const { unFollowUserId } = req.body;

    // Update and get the new user document in one step
    const updatedCurrentUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: unFollowUserId } }, // $pull removes the ID
        { new: true } // IMPORTANT: Returns the document AFTER the update
    ).select('-password -refreshToken');

    // Also update the other user's followers
    await User.findByIdAndUpdate(unFollowUserId, {
        $pull: { followers: req.user._id }
    });

    return res.status(200).json(
        new ApiResponse(200, { currentUser: updatedCurrentUser }, 'User unfollowed successfully')
    );
});


const approveFollowRequest = asyncHandler(async (req, res) => {
    const { approveUserId } = req.body;
    const currentUserId = req.user._id;

    // First, remove the request and add the follower to the current user
    const updatedCurrentUser = await User.findByIdAndUpdate(currentUserId,
        {
            $addToSet: { followers: approveUserId }, // Use addToSet for safety
            $pull: { followRequestsReceived: approveUserId }
        },
        { new: true }
    );

    // Then, update the other user's `following` list
    await User.findByIdAndUpdate(approveUserId,
        {
            $addToSet: { following: currentUserId },
            $pull: { followRequestsSent: currentUserId } // Also remove it from their sent requests
        }
    );

    // *** CRITICAL CHANGE ***
    // Fetch the full user object of the person who was just approved.
    const approvedUser = await User.findById(approveUserId).select('username fullname profilePicture _id');

    return res.status(200).json(
        new ApiResponse(200, {
            currentUser: updatedCurrentUser, // The logged-in user
            approvedUser: approvedUser, // The user who was approved
        }, 'Follow request approved successfully')
)});
const rejectFollowRequest = asyncHandler(async (req,res) => {
    const {rejectUserId} = req.body

    const currentUser = await User.findByIdAndUpdate(req.user._id,
        {
            $pull : {
                followRequestsReceived : rejectUserId
            }
        },
        {
            new : true
        }
    )

    const rejectedUser = await User.findByIdAndUpdate(rejectUserId,
        {
            $pull : {
                followRequestsSent : req.user._id
            }
        },
        {
            new : true
        }
    )

    return res.status(200)
    .json(
        new ApiResponse(200,{currentUser},'follow request rejected successfully')
    )
    
})

const exploreSection = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20


    const posts = await Post.aggregate([
        { $sample: { size: limit } },
    ])

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    return res.status(200).json(new ApiResponse(200, posts, 'explore section'))
})


const postFeeds = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
            {
            $match: {
                'media.type': { $ne: 'video' }, // Exclude posts with any video
                media: { $exists: true, $ne: [] } // Ensure media exists and is not empty
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
        $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
            pipeline: [
            { $project: { _id: 1, username: 1,profilePicture : 1 } } // Include only _id and username
            ]
        }
        },
        {
        $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions',
            pipeline: [
            { $project: { _id: 1, username: 1,profilePicture : 1,fullname : 1,followers : 1} } // Include only _id and username
            ]
        }
        },
        {
        $lookup: {
            from: 'users',
            localField: 'likedBy',
            foreignField: '_id',
            as: 'likedByUsers',
            pipeline: [
            { $project: { _id: 1, username: 1,profilePicture : 1,fullname : 1 , followers : 1} } // Include only _id and username
            ]
        }
        },
        {
        $project: {
            _id: 1,
            owner: { $arrayElemAt: ['$owner', 0] }, // Get the first owner (assuming one owner)
            media: 1,
            caption: 1,
            mentions: 1, // Keep the entire mentions array
            hashtags: 1,
            likes: 1,
            likedByUsers: 1, // Keep the entire likedByUsers array
            comments: 1,
            isArchived: 1,
            savedBy: 1,
            createdAt: 1,
            updatedAt: 1
        }
        }
    ]);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    return res.status(200).json(
        new ApiResponse(200, posts, 'posts feed')
    );
});

export const searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(200).json(
            new ApiResponse(200, [], "Search query too short")
        );
    }

    const users = await User.find({
        $or: [
            { username: { $regex: q, $options: 'i' } },
            { fullName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ],
        _id: { $ne: req.user._id }
    })
    .select('username fullName email profilePicture')
    .limit(20);

    return res.status(200).json(
        new ApiResponse(200, users, "Users found")
    );
});

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
    getUserProfilesById,
    makeProfilePrivateOrPublic,
    makeProfileVerified,
    followAnUser,
    unfollowAnUser,
    approveFollowRequest,
    rejectFollowRequest,
    exploreSection,
    postFeeds}