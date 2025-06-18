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
    async(postId,{rejectWithValue}) => {
        try {
            const response = await axios.post('/api/v1/post/like',{postId},{withCredentials : true})
            return response.data.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)   
        }
    }
)

const postSlice = createSlice({
    name : 'post',
    initialState : initialState,
    reducers : {},
    extraReducers : (builder) => {
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
                state.isLikedByPost[postId] = isLiked;
                console.log(action.payload);
                
            })
            .addCase(toggleLikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export default postSlice.reducer