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
    async(postId, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/v1/post/like', { postId }, { withCredentials: true });
            return response.data.data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to toggle like';
            console.error('Toggle like error:', error);
            return rejectWithValue(message);
        }
    }
);

const postSlice = createSlice({
    name: 'post',
    initialState: initialState,
    reducers: {
        initializeLikedStatus: (state, action) => {
            const { posts, currentUserId } = action.payload;
            posts.forEach(post => {
                state.likesByPost[post._id] = post.likes;
                state.isLikedByPost[post._id] = post.likedBy?.includes(currentUserId) || false;
            });
        },
        resetPostState : (state) => {
            return initialState
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

export const { initializeLikedStatus,resetPostState } = postSlice.actions;
export default postSlice.reducer;