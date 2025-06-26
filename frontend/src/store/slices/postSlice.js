import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    likesByPost: {},
    isLikedByPost: {},
    loading: false,
    error: null,
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

            const response = await axios.post('/api/v1/post/like', { postId }, { withCredentials: true });

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
    }
});

export const { initializeLikedStatus,resetPostState,setUserLikedPosts} = postSlice.actions;
export default postSlice.reducer;