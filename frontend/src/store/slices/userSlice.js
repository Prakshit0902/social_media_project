import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    profilesById: {},
    selectedUserId: null,
    loading: false,
    error: null
}

export const getUserProfilesByIds = createAsyncThunk(
    'user/get-user-profile',
    async (ids,{rejectWithValue}) => {
        try {
            const response = await axios.post('/api/v1/user/profiles', {ids})
            // console.log(response.data.data)
            
            return response.data.data
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
            console.log(message)
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
        }
    },

    extraReducers : (builder) => {
        builder
        .addCase(getUserProfilesByIds.pending , (state) => {
            state.loading = true
            state.error = null
            state.profilesById = {}
        })
        .addCase(getUserProfilesByIds.fulfilled , (state,action) => {
            action.payload.users.forEach(user => {
                state.profilesById[user._id] = user;
            })
        })
        .addCase(getUserProfilesByIds.rejected , (state,action) => {
            state.loading = false
            state.error = action.payload
        })
    }
})
export const {resetUserState} = userSlice.actions
export default userSlice.reducer