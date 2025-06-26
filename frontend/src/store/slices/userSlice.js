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

    export const updateAccountDetails = createAsyncThunk(
        'user/update',
        async (formData,{rejectWithValue}) => {
            try {
                const response = await axios.patch('/api/v1/user/update-account-details',formData,{withCredentials : true})
                return response.data
            } catch (error) {
                const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
                console.log(message)
                return rejectWithValue(message)   
            }
        }
    )

    export const updateBio = createAsyncThunk(
        'user/update-bio',
        async(formData,{rejectWithValue}) => {
            try {
                const response = await axios.patch('/api/v1/user/update-bio',formData,{withCredentials : true})
                return response.data
            } catch (error) {
                const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
                console.log(message)
                return rejectWithValue(message)   
            }
        }
    )

    export const makeProfilePrivateOrPublic = createAsyncThunk(
        'user/update-privacy',
        async(isPrivate,{rejectWithValue}) => {
            try {
            
                const response = await axios.post('/api/v1/user/profile-privacy',{isPrivate},{withCredentials : true})
                console.log(response.data);
                
                return response.data
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
            },
            clearUserProfile: (state) => {
                state.profileById = null
                state.loading = false // Reset loading state
                state.error = null
            }
        },

        extraReducers : (builder) => {
            builder
            .addCase(getUserProfilesByIds.pending , (state) => {
                state.loading = true
                state.error = null
                // state.profilesById = {}
            })
            .addCase(getUserProfilesByIds.fulfilled , (state,action) => {
                state.loading = false
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
            .addCase(followUser.fulfilled, (state, action) => {
                const { currentUser, message } = action.payload.data;
                const followedUserId = action.meta.arg; // ID of the user being actioned on

                // --- SAFETY CHECKS ---
                // 1. Make sure we have a profile loaded in the state
                if (!state.profileById?.user) {
                    return;
                }
                // 2. Make sure the action corresponds to the profile we are currently viewing
                if (state.profileById.user._id !== followedUserId) {
                    return;
                }
                // 3. Make sure we have the logged-in user's info to perform the update
                if (!currentUser?._id) {
                    return;
                }
                
                // --- LOGIC BASED ON API MESSAGE ---

                if (message?.startsWith("You started following")) {
                    console.log('reached her ');
                    
                    // Add the logged-in user to the followers list
                    if (Array.isArray(state.profileById.user.followers)) {
                        state.profileById.user.followers.push({
                            _id: currentUser._id,
                            username: currentUser.username,
                            fullname: currentUser.fullname,
                            profilePicture: currentUser.profilePicture,
                        });
                    }
                } 
                else if (message?.startsWith("Follow request withdrawn")) {
                    console.log('reached her withdr');
                    // THIS IS THE CRITICAL FIX: Remove the logged-in user's ID from the received requests list
                    if (Array.isArray(state.profileById.user.followRequestsReceived)) {
                        state.profileById.user.followRequestsReceived = 
                            state.profileById.user.followRequestsReceived.filter(
                                (id) => id.toString() !== currentUser._id.toString()
                            );
                    }
                } 
                else if (message?.startsWith("Follow request sent")) {
                    console.log('reached her requ');
                    // Add the logged-in user's ID to the received requests list
                    if (Array.isArray(state.profileById.user.followRequestsReceived)) {
                        // Use addToSet logic to be safe
                        if (!state.profileById.user.followRequestsReceived.includes(currentUser._id)) {
                            state.profileById.user.followRequestsReceived.push(currentUser._id);
                        }
                    }
                }
            })
            .addCase(unFollowUser.fulfilled, (state, action) => {
                const { currentUser } = action.payload.data;
                const unfollowedUserId = action.meta.arg;

                if (state.profileById?.user?._id === unfollowedUserId && currentUser?._id) {
                    if (Array.isArray(state.profileById.user.followers)) {
                        state.profileById.user.followers =
                            state.profileById.user.followers.filter(
                                (follower) => follower._id.toString() !== currentUser._id.toString()
                            );
                    }
                }
            })
            .addCase(makeProfilePrivateOrPublic.pending , (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(makeProfilePrivateOrPublic.fulfilled , (state,action) => {
                state.loading = false
                state.error = null

            })
            .addCase(makeProfilePrivateOrPublic.rejected,(state,action) => {
                state.loading = false
                state.error = action.payload

            })

        }
    })
    export const {resetUserState,clearUserProfile } = userSlice.actions
    export default userSlice.reducer