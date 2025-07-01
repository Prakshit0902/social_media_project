  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
  import axios from "axios";
  import { useDispatch } from "react-redux";
  import { resetExplorePage, resetFeedPage } from "./feedSlice";
  import { persistor } from "../store";
  import { approveFollowRequest, followUser, rejectFollowRequest, unFollowUser } from "./followSlice";
import { makeProfilePrivateOrPublic } from "./userSlice";
import { axiosPrivate, axiosPublic } from "../../utils/api";


  const initialState = {
    user: null,
    loading : false,
    error : null,
    isAuthenticated: false,
    authChecked: false,
    isTransitioning: false,
  }

  export const registerBasicUserDetails = createAsyncThunk(
    'user/register-basic',
    async(formData, {rejectWithValue}) => {
      try {
        console.log(formData)
        
        const response = await axiosPublic.patch('/api/v1/user/register-basic',formData,{withCredentials : true})
        console.log(response)
        
        return response.data
      } 
      catch (error) {
        const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
        console.log(message)
        return rejectWithValue(message)
      }
    }
  )

  export const refreshAccessToken = createAsyncThunk(
    "user/refresh-access-token",
    async (_,{rejectWithValue}) => {
      try {
        const response = await axiosPublic.post('/api/v1/user/refresh-access-token')
        return response.data
      } catch (error) {
        const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
        console.log(message)
        return rejectWithValue(message) 
      }
    }
  )

  export const fetchCurrentUser = createAsyncThunk(
    "user/current-user",
    async(_ , {rejectWithValue}) => {
      try {
        const response = await axios.get('/api/v1/user/current-user',{},{withCredentials : true})
        return response.data
      } catch (error) {
          const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
          console.log(message)
            
          return rejectWithValue(message)
      }
    }
  )

  export const signupUser = createAsyncThunk(
    "user/register",
    async (userData, { rejectWithValue }) => {
      try {
        const response = await axiosPublic.post("/api/v1/user/register", userData);
        console.log('success');
        
        return response.data;
      } catch (error) {
        // Fallback to multiple sources in case one is undefined
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred during signup";
          console.log(message)
          
        return rejectWithValue(message);
      }
    }
  )

  export const loginUser = createAsyncThunk(
    'user/login',
    async (userData, {rejectWithValue}) => {
      try {
        const response = await axiosPublic  .post('/api/v1/user/login',userData, {withCredentials : true}) 
        return {
          user: response.data.data.user,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
        }
      } catch (error) {
          const message = error.response?.data?.message || error?.messsage || 'Unknown error occured during login' 
          return rejectWithValue(message)     
      }
    }
  )

  export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_,{rejectWithValue}) => {
      try {
          const response = await axiosPrivate.post('/api/v1/user/logout', {} , {withCredentials : true})
          return response.data
      } catch (error) {
          const message = error.response?.data?.message || error?.message || 'Unknown error occured during login' 
          return rejectWithValue(message)
      }
    }
  )
  export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { dispatch, getState, rejectWithValue }) => {
      const state = getState();
      
      // If already authenticated and has user data, skip initialization
      if (state.auth.isAuthenticated && state.auth.user) {
        return state.auth.user;
      }
      
      try {
        const currentUserResponse = await dispatch(fetchCurrentUser()).unwrap();
        return currentUserResponse;
      } catch (error) {
        console.log("Fetching current user failed, attempting to refresh token...");
        try {
          const refreshTokenResponse = await dispatch(refreshAccessToken()).unwrap();
          return refreshTokenResponse;
        } catch (refreshError) {
          console.log("Token refresh failed. User is not authenticated.",refreshError);
          return rejectWithValue(refreshError);
        }
      }
    }
  );

  const authSlice = createSlice({
    name : 'auth',
    initialState : initialState,
    reducers : {
        resetAuthState: (state) => {
          return {
          ...initialState,
          authChecked : true
        }
      },
      clearTransition: (state) => {
        state.isTransitioning = false;
      }
    },

    extraReducers : (builder) => {
      builder
          .addCase(signupUser.pending , (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        // --- MODIFICATION: Extract user from the .data property of the axiosPrivate response ---
        state.user = action.payload.data; 
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(signupUser.rejected ,(state,action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled,(state,action) => {
          state.loading = false;
          state.user = action.payload.user; // Correctly access the .user property
          state.isAuthenticated = true;
          state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state,action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchCurrentUser reducers are now primarily used by initializeAuth
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        // --- MODIFICATION: Extract user from the .data property ---
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true; 
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        // On rejection, we don't know the final auth status yet, so don't touch authChecked
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        // The final state will be set by initializeAuth.rejected
      })
      
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        // --- MODIFICATION: Extract user from the .data property ---
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.loading = false;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        // The final state will be set by initializeAuth.rejected
      })

      .addCase(registerBasicUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isTransitioning = true; // Set this to true when updating profile
      })
      .addCase(registerBasicUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.data;
        // Keep isTransitioning true - we'll clear it after navigation
      })
      .addCase(registerBasicUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isTransitioning = false;
      })

      // --- ADDITION: Reducers for our new initialization thunk ---
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        // The user state will have already been set by fetchCurrentUser or refreshAccessToken.
        // We just need to confirm the final status.
        state.isAuthenticated = true;
        state.authChecked = true;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        // This is the final failure state. Now we know for sure the user is not logged in.
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true; // Crucially, the check is complete.
        state.loading = false;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { currentUser } = action.payload.data;
        console.log(currentUser);
        
        if (currentUser) {
            // This updates the logged-in user's `following` and `followRequestsSent` arrays
            state.user = currentUser;
        }
        })
      .addCase(unFollowUser.fulfilled, (state, action) => {
            // FIX: Added this missing case to keep the auth.user state in sync
        const { currentUser } = action.payload.data;
        if (currentUser) {
            state.user = currentUser;
        }
        })
      .addCase(approveFollowRequest.fulfilled, (state, action) => {
          const { currentUser } = action.payload.data;
          // When the logged-in user approves a request, their `followRequestsReceived` array changes.
          if (currentUser) {
              state.user = currentUser;
          }
      })
      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
          const { currentUser } = action.payload.data;
          if (currentUser) {
              state.user = currentUser;
          }
      })
      .addCase(makeProfilePrivateOrPublic.fulfilled , (state,action) => {
        if (action.payload && action.payload.data){
          state.user = action.payload.data?.currentUser
        }
      })

    }
  }
  )

  export const { resetAuthState , clearTransition} = authSlice.actions

  export default authSlice.reducer;
