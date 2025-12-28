import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
// import api from "api";
import { approveFollowRequest, followUser, rejectFollowRequest, unFollowUser } from "./followSlice";
import  { axiosPrivate } from "../../utils/api";

const initialState = {
    profilesById: {},
    selectedUserId: null,
    loading: false,
    error: null,
    profileById : null,
    likedPosts: {
        posts: [],
        loading: false,
        error: null,
        pagination: null,
        fetched: false
    },
    savedPosts: {
        posts: [],
        loading: false,
        error: null,
        pagination: null,
        fetched: false
    }
}

export const getUserProfilesByIds = createAsyncThunk(
    'user/get-user-profile',
    async (ids,{rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/user/profiles', {ids})
            // console.log(response.data.data)
            
            return response.data.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)   
        }
    }
    
)

export const getUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (identifier , {rejectWithValue}) => {
        try {
            console.log('trying to get response');
            const response = await axiosPrivate.get(`/api/v1/user/profile/${identifier}`)
            // console.log(response);
            
            return response.data.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)   
        }
    }
)

export const updateAccountDetails = createAsyncThunk(
    'user/update',
    async (formData,{rejectWithValue}) => {
        try {
            const response = await axiosPrivate.patch('/api/v1/user/update-account-details',formData,{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)   
        }
    }
)

export const changePassword = createAsyncThunk(
    'user/change-password',
    async (formData,{rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/user/change-password',formData,{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)   
        }
    }
)


export const makeProfilePrivateOrPublic = createAsyncThunk(
    'user/update-privacy',
    async(isPrivate,{rejectWithValue}) => {
        try {
        
            const response = await axiosPrivate.post('/api/v1/user/profile-privacy',{isPrivate},{withCredentials : true})
            console.log(response.data);
            
            return response.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)   
        }
    }
)
export const searchUsers = createAsyncThunk(
'user/searchUsers',
    async (query, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get(`/api/v1/user/search?q=${query}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

export const getLikedPosts = createAsyncThunk(
    'user/getLikedPosts',
    async ({page = 1,reset = false},{rejectWithValue}) => {
        try {
            const response = await axiosPrivate.get(`/api/v1/user/liked-posts?page=${page}&limit=12`)
            return {
                data : response.data.data,page,reset
            }
        } catch (error) {
            return rejectWithValue(message)
        }
    }
)
export const getSavedPosts = createAsyncThunk(
    'user/getSavedPosts',
    async ({page = 1,reset = false},{rejectWithValue}) => {
        try {
            const response = await axiosPrivate.get(`/api/v1/user/saved-posts?page=${page}&limit=12`)
            return {
                data : response.data.data,page,reset
            }
        } catch (error) {
            return rejectWithValue(message)
        }
    }
)
const userSlice = createSlice({
    name : 'user',
    initialState : initialState,
    reducers : {
        resetUserState : (state) => {
            return initialState
        },
        clearUserProfile: (state) => {
            state.profileById = null
            state.loading = false // Reset loading state
            state.error = null
        },
        resetLikedPosts : (state) => {
            state.likedPosts = initialState.likedPosts
        },
        resetSavedPosts : (state) => {
            state.savedPosts = initialState.savedPosts
        }
    },

    extraReducers : (builder) => {
        builder
        .addCase(getUserProfilesByIds.pending , (state) => {
            state.loading = true
            state.error = null
            // state.profilesById = {}
        })
        .addCase(getUserProfilesByIds.fulfilled , (state,action) => {
            state.loading = false
            action.payload.users.forEach(user => {
                state.profilesById[user._id] = user;
            })
        })
        .addCase(getUserProfilesByIds.rejected , (state,action) => {
            state.loading = false
            state.error = action.payload
        })

        .addCase(getUserProfile.pending , (state) => {
            state.loading = true
            state.error = null
            state.profileById = null
            console.log('rejected');
        })
        .addCase(getUserProfile.fulfilled , (state,action) => {
            state.loading = false
            state.error = null
            state.profileById = action.payload
            console.log('action payload',action.payload);
            
        })
        .addCase(getUserProfile.rejected , (state,action) => {
            state.loading = false
            state.error = action.payload
            state.profileById = null
            console.log('rejected',action.payload);
            
        })
        .addCase(followUser.fulfilled, (state, action) => {
            const { status, currentUser } = action.payload.data;
            const followedUserId = action.meta.arg;

            if (!state.profileById?.user || state.profileById.user._id !== followedUserId) {
                return;
            }

            switch (status) {
                case 'following':
                    // This is correct: push the user object
                    state.profileById.user.followers.push({
                        _id: currentUser._id,
                        username: currentUser.username,
                        fullname: currentUser.fullname,
                        profilePicture: currentUser.profilePicture,
                    });
                    break;

                case 'requested':
                    // --- THIS IS THE CRITICAL FIX ---
                    // We must push the FULL USER OBJECT, not just the ID.
                    // This makes the data structure consistent with what your backend sends on page load.
                    state.profileById.user.followRequestsReceived.push({
                        _id: currentUser._id,
                        username: currentUser.username,
                        fullname: currentUser.fullname,
                        profilePicture: currentUser.profilePicture,
                    });
                    break;

                case 'withdrawn':
                    // This logic is now also correct because we are filtering an array of objects
                    state.profileById.user.followRequestsReceived =
                        state.profileById.user.followRequestsReceived.filter(
                            (requester) => requester._id.toString() !== currentUser._id.toString()
                        );
                    break;
                    
                default:
                    break;
            }
        })

        .addCase(unFollowUser.fulfilled, (state, action) => {
            const { currentUser } = action.payload.data;
            const unfollowedUserId = action.meta.arg;

            if (state.profileById?.user?._id === unfollowedUserId) {
                // Filter out the logged-in user from the followers list
                state.profileById.user.followers =
                    state.profileById.user.followers.filter(
                        (follower) => follower._id.toString() !== currentUser._id.toString()
                    );
            }
        })

        .addCase(approveFollowRequest.fulfilled, (state, action) => {
            // We are viewing our own profile (isOwner should be true)
            if (!state.profileById?.user || !state.profileById.isOwner) {
                return;
            }

            // Destructure the NEW `approvedUser` object from our API response
            const { approvedUser } = action.payload.data;
            if (!approvedUser) return; // Safety check

            // 1. Remove user from `followRequestsReceived` array
            state.profileById.user.followRequestsReceived =
                state.profileById.user.followRequestsReceived.filter(
                    (requester) => requester._id.toString() !== approvedUser._id.toString()
                );

            // 2. Add the full user object to `followers` array
            state.profileById.user.followers.push(approvedUser);
        })

        .addCase(rejectFollowRequest.fulfilled, (state, action) => {
            // The user ID of the rejected person is passed in the thunk argument
            const rejectedUserId = action.meta.arg;

            if (!state.profileById?.user || !state.profileById.isOwner) {
                return;
            }

            // Remove user from `followRequestsReceived` array by their ID
            state.profileById.user.followRequestsReceived =
                state.profileById.user.followRequestsReceived.filter(
                    (requester) => requester._id.toString() !== rejectedUserId.toString()
                );
        })

        .addCase(makeProfilePrivateOrPublic.pending , (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(makeProfilePrivateOrPublic.fulfilled , (state,action) => {
            state.loading = false
            state.error = null

        })
        .addCase(makeProfilePrivateOrPublic.rejected,(state,action) => {
            state.loading = false
            state.error = action.payload

        })

        .addCase(getLikedPosts.pending, (state) => {
            state.likedPosts.loading = true;
            state.likedPosts.error = null;
        })
        .addCase(getLikedPosts.fulfilled, (state, action) => {
            state.likedPosts.loading = false;
            state.likedPosts.fetched = true;
            state.likedPosts.pagination = action.payload.data.pagination;
            
            if (action.payload.reset || action.payload.page === 1) {
                state.likedPosts.posts = action.payload.data.posts;
            } else {
                state.likedPosts.posts = [...state.likedPosts.posts, ...action.payload.data.posts];
            }
        })
        .addCase(getLikedPosts.rejected, (state, action) => {
            state.likedPosts.loading = false;
            state.likedPosts.error = action.payload;
        })

        // Saved Posts
        .addCase(getSavedPosts.pending, (state) => {
            state.savedPosts.loading = true;
            state.savedPosts.error = null;
        })
        .addCase(getSavedPosts.fulfilled, (state, action) => {
            state.savedPosts.loading = false;
            state.savedPosts.fetched = true;
            state.savedPosts.pagination = action.payload.data.pagination;
            
            if (action.payload.reset || action.payload.page === 1) {
                state.savedPosts.posts = action.payload.data.posts;
            } else {
                state.savedPosts.posts = [...state.savedPosts.posts, ...action.payload.data.posts];
            }
        })
        .addCase(getSavedPosts.rejected, (state, action) => {
            state.savedPosts.loading = false;
            state.savedPosts.error = action.payload;
        })

    }
})
export const {resetUserState,clearUserProfile,resetLikedPosts,resetSavedPosts} = userSlice.actions
export default userSlice.reducer