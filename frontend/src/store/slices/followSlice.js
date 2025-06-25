import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    loading : false,
    error : null
}

export const userFollowers = (state) => state.user?.followers
export const userFollowing = (state) => state.user?.following

export const followUser = createAsyncThunk(
    'user/follow',
    async(id , {rejectWithValue}) => {
        try {
            const response = await axios.post('/api/v1/user/follow-user',{followUserId : id},{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to toggle like';
            console.error('following an user failed with:', error);
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
        .addCase(followUser.pending , (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(followUser.fulfilled , (state,action) => {
            state.loading = false
            state.error = null
            console.log(action.payload)
        })
        .addCase(followUser.rejected, (state,action) => {
            state.loading = false
            state.error = action.payload
        })
    }
})

export default followSlice.reducer