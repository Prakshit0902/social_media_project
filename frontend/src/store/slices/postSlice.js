import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { axiosPrivate } from "../../utils/api";
import axios from "axios";
// import api from "api";

const initialState = {
    likesByPost: {},
    isLikedByPost: {},
    isSavedByPost: {},
    loading: false,
    error: null,
    commentsByPost : {},
    createPostLoading: false,
    createPostError: null,
    posts: []
}

export const toggleLikePost = createAsyncThunk(
    'post/like',
    // We add `thunkAPI` as the second argument to get access to `getState`
    async (postId, { getState, rejectWithValue }) => {
        try {
            // Get the current user's data from the auth slice
            const { auth } = getState();
            const currentUser = auth.user;

            if (!currentUser) {
                return rejectWithValue('User not authenticated');
            }

            const response = await axiosPrivate.post('/api/v1/post/like', { postId }, { withCredentials: true });

            // --- THIS IS THE KEY CHANGE ---
            // We now return a richer payload that includes the user info.
            return {
                ...response.data.data, // This contains { updatedPost, isLiked }
                currentUser: {
                    _id: currentUser._id,
                    username: currentUser.username,
                    profilePicture: currentUser.profilePicture,
                    // You can add more fields if needed by the modal
                }
            };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to toggle like';
            return rejectWithValue(message);
        }
    }
)

export const toggleSavePost = createAsyncThunk(
    'post/save',
    async (postId, {getState,rejectWithValue}) => {
        try {
            const {auth} = getState()
            const currentUser = auth.user

            if (!currentUser) {
                return rejectWithValue('user not authenticated')
            }

            const response = await axiosPrivate.post('/api/v1/post/save',{postId},{withCredentials : true})
            return response.data.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to toggle like';
            return rejectWithValue(message);
        }
    }
)

export const createPost = createAsyncThunk(
    'post/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post('/api/v1/post/create', formData, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to create post';
            return rejectWithValue(message);
        }
    }
)

const postSlice = createSlice({
    name: 'post',
    initialState: initialState,
    reducers: {
        initializeLikedStatus: (state, action) => {
            const { posts, currentUserId } = action.payload;
            posts.forEach(post => {
                state.likesByPost[post._id] = post.likes || 0;
                state.isLikedByPost[post._id] = post.likedByUsers?.some(user => user._id === currentUserId) || false;
            });
        },
        initializeSavedStatus: (state, action) => {
            const { posts, currentUserId } = action.payload;
            posts.forEach(post => {
                if (post && post._id && Array.isArray(post.savedBy)) {
                    state.isSavedByPost[post._id] = post.savedBy.some(
                        id => id.toString() === currentUserId.toString()
                    );
                } else {
                    state.isSavedByPost[post._id] = false;
                }
            });
        },
        resetPostState : (state) => {
            return initialState
        },
        setUserLikedPosts: (state, action) => {
            const likedPostIds = action.payload;
            state.userLikedPosts = likedPostIds;
            // Set isLikedByPost for all liked posts
            likedPostIds.forEach(postId => {
                state.isLikedByPost[postId] = true;
            });
        },
        addNewPost: (state, action) => {
            state.posts.unshift(action.payload);
        },
        setPostSavedOptimistic: (state, action) => {
            if (!state.isSavedByPost) state.isSavedByPost = {};
            const { postId, isSaved } = action.payload;
            state.isSavedByPost[postId] = isSaved;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleLikePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleLikePost.fulfilled, (state, action) => {
                state.loading = false;
                const { updatedPost, isLiked } = action.payload;
                const postId = updatedPost._id;
                state.likesByPost[postId] = updatedPost.likes;
                state.isLikedByPost[postId] = !isLiked;
                console.log('Like toggled successfully:', action.payload);
            })
            .addCase(toggleLikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('Like toggle failed:', action.payload);
            })
            .addCase(toggleSavePost.rejected, (state,action) => {
                state.loading = false
                state.error = action.payload
                console.error('Save toggle failed',action.payload)
                
            }) 
            .addCase(toggleSavePost.fulfilled,(state,action) => {
                state.loading = false
                const { updatedPost, isSaved } = action.payload;
                const postId = updatedPost._id;
                state.isSavedByPost[postId] = !isSaved;
                console.log('successfully toggled save post',action.payload)
            })
            .addCase(toggleSavePost.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createPost.pending, (state) => {
                state.createPostLoading = true;
                state.createPostError = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.createPostLoading = false;
                state.posts.unshift(action.payload);
                console.log('Post created successfully:', action.payload);
            })
            .addCase(createPost.rejected, (state, action) => {
                state.createPostLoading = false;
                state.createPostError = action.payload;
                console.error('Post creation failed:', action.payload);
            })
    }
});

export const {setPostSavedOptimistic,initializeLikedStatus,initializeSavedStatus,resetPostState,setUserLikedPosts,addNewPost} = postSlice.actions;
export default postSlice.reducer;