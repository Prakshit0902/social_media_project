import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    posts: [],
    loading: false,
    error: null,
}

export const getUserPostFeed = createAsyncThunk(
    'user/get-post-feed',
    async (_,{rejectWithValue}) => {
        try {
            const response = await axios.get('/api/v1/user/post-feed')
            return response.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)  
        }
    }
)
export const getUserExploreFeed = createAsyncThunk(
    'user/explore',
    async (_,{rejectWithValue}) => {
        try {
            const response = await axios.get('/api/v1/user/explore', {withCredentials : true})

            return response.data.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
            return rejectWithValue(message)  
        }
    }
)


const feedSlice = createSlice({
    name : 'feed',
    initialState : initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder
        .addCase(getUserPostFeed.pending , (state) => {
            state.loading = true
            state.error = null
        })

        .addCase(getUserPostFeed.fulfilled, (state,action) => {
            state.loading = false
            state.error = null
            state.posts = action.payload.data
        })
        .addCase(getUserPostFeed.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            console.log(action.payload);
            
        })
        .addCase(getUserExploreFeed.pending , (state) => {
            console.log('pending');
            
            state.loading = true
            state.error = null
            // console.log(action.payload);

        })

        .addCase(getUserExploreFeed.fulfilled, (state,action) => {
            console.log('fulfilled');
            state.loading = false
            state.error = null
            state.posts = action.payload.data
            console.log(action.payload);
            
        })
        .addCase(getUserExploreFeed.rejected, (state, action) => {
            console.log('rejected');
            state.loading = false
            state.error = action.payload
            console.error('Step 18: Rejected case triggered');
            console.error('Step 19: Error payload:', action.payload);
            console.log(action.payload);
        })
    }
})

export default feedSlice.reducer