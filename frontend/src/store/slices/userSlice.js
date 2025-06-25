    import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
    import axios from "axios";
    import { followUser, unFollowUser } from "./followSlice";

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
                // console.log('action payload',action.payload);
                
            })
            .addCase(getUserProfile.rejected , (state,action) => {
                state.loading = false
                state.error = action.payload
                state.profileById = null
                console.log('rejected',action.payload);
                
            })
            .addCase(followUser.fulfilled, (state, action) => {
                const loggedInUser = action.payload?.data?.currentUser;
                const followedUserId = action.meta.arg; // This is the ID passed to the thunk

                // Check if the currently viewed profile is the one that was just followed
                if (state.profileById?.user?._id === followedUserId && loggedInUser) {
                // Add the logged-in user to the followers list of the profile being viewed
                state.profileById.user.followers.push({
                    _id: loggedInUser._id,
                    username: loggedInUser.username,
                    fullname: loggedInUser.fullname,
                    profilePicture: loggedInUser.profilePicture,
                });
                }
            })
            .addCase(unFollowUser.fulfilled, (state, action) => {
                const loggedInUser = action.payload?.data?.currentUser;
                const unfollowedUserId = action.meta.arg; // This is the ID passed to the thunk

                // Check if the currently viewed profile is the one that was just unfollowed
                if (state.profileById?.user?._id === unfollowedUserId && loggedInUser) {
                // Remove the logged-in user from the followers list
                state.profileById.user.followers =
                    state.profileById.user.followers.filter(
                    (follower) => follower._id !== loggedInUser._id
                    );
                }
            })

        }
    })
    export const {resetUserState} = userSlice.actions
    export default userSlice.reducer