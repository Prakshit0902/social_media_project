import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    profilesById: {},
    selectedUserId: null,
    loading: false,
    error: null,
    profileById : null
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

export const getUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (identifier , {rejectWithValue}) => {
        try {
            console.log('trying to get response');
            const response = await axios.get(`/api/v1/user/profile/${identifier}`)
            // console.log(response);
            
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

        .addCase(getUserProfile.pending , (state) => {
            state.loading = true
            state.error = null
            state.profileById = null
            console.log('rejected');
        })
        .addCase(getUserProfile.fulfilled , (state,action) => {
            state.loading = false
            state.error = null
            state.profileById = action.payload
            console.log('action payload',action.payload);
            
        })
        .addCase(getUserProfile.rejected , (state,action) => {
            state.loading = false
            state.error = action.payload
            state.profileById = null
            console.log('rejected',action.payload);
            
        })
    }
})
export const {resetUserState} = userSlice.actions
export default userSlice.reducer