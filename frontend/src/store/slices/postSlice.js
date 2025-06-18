import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    likeLoading : false,

}

export const likePost = createAsyncThunk(
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
        .addCase(likePost.pending , (state) => {
            state.likeLoading = true
        })
    }
})

export default postSlice.reducer