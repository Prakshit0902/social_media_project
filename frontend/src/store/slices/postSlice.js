import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { axiosPrivate } from "../../utils/api";
// import api from "api";

const initialState = {
    likesByPost: {},
    isLikedByPost: {},
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

export const createPost = createAsyncThunk(
    'post/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post('/api/v1/post/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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
                // Note: isLiked from backend is the state BEFORE toggle
                state.isLikedByPost[postId] = !isLiked;
                console.log('Like toggled successfully:', action.payload);
            })
            .addCase(toggleLikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('Like toggle failed:', action.payload);
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

export const { initializeLikedStatus,resetPostState,setUserLikedPosts,addNewPost} = postSlice.actions;
export default postSlice.reducer;