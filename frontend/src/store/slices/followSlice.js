import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import api from "api";
import { axiosPrivate } from "../../utils/api";

const initialState = {
    loading : false,
    loadingId: null,
    error : null,
}

export const userFollowers = (state) => state.user?.followers
export const userFollowing = (state) => state.user?.following

export const followUser = createAsyncThunk(
    'user/follow',
    async(id , {rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/user/follow-user',{followUserId : id},{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to toggle like';
            console.error('following an user failed with:', error);
            return rejectWithValue(message) 
        }
    }
)
export const unFollowUser = createAsyncThunk(
    'user/unfollow',
    async(id , {rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/user/unfollow-user',{unFollowUserId : id},{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to toggle like';
            console.error('following an user failed with:', error);
            return rejectWithValue(message) 
        }
    }
)
export const approveFollowRequest = createAsyncThunk(
    'user/approve-follow',
    async(id , {rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/user/approve-follow-request',{approveUserId : id},{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to approve user request';
            console.error('request approving an user request failed with:', error);
            return rejectWithValue(message) 
        }
    }
)
export const rejectFollowRequest = createAsyncThunk(
    'user/reject-follow',
    async(id , {rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/user/reject-follow-request',{rejectUserId : id},{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to reject user request';
            console.error('request rejecting an user request failed with:', error);
            return rejectWithValue(message) 
        }
    }
)



const followSlice = createSlice({
    name : 'follow',
    initialState : initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder
        .addCase(followUser.pending, (state, action) => {
            state.loading = true;
            state.loadingId = action.meta.arg; // The user ID passed to the thunk
            state.error = null;
        })
        .addCase(followUser.fulfilled, (state) => {
            state.loading = false;
            state.loadingId = null;
        })
        .addCase(followUser.rejected, (state, action) => {
            state.loading = false;
            state.loadingId = null;
            state.error = action.payload;
        })

        // --- Unfollow User ---
        .addCase(unFollowUser.pending, (state, action) => {
            state.loading = true;
            state.loadingId = action.meta.arg; // The user ID passed to the thunk
            state.error = null;
        })
        .addCase(unFollowUser.fulfilled, (state) => {
            state.loading = false;
            state.loadingId = null;
        })
        .addCase(unFollowUser.rejected, (state, action) => {
            state.loading = false;
            state.loadingId = null;
            state.error = action.payload;
        })
        .addCase(approveFollowRequest.pending , (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(approveFollowRequest.fulfilled , (state,action) => {
            state.loading = false
            state.error = null
            console.log(action.payload)
        })
        .addCase(approveFollowRequest.rejected, (state,action) => {
            state.loading = false
            state.error = action.payload
        })
        .addCase(rejectFollowRequest.pending , (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(rejectFollowRequest.fulfilled , (state,action) => {
            state.loading = false
            state.error = null
            console.log(action.payload)
        })
        .addCase(rejectFollowRequest.rejected, (state,action) => {
            state.loading = false
            state.error = action.payload
        })

    }
})

export default followSlice.reducer