import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { approveFollowRequest, followUser, rejectFollowRequest, unFollowUser } from "./followSlice";
import { makeProfilePrivateOrPublic } from "./userSlice";
import { axiosPrivate, axiosPublic } from "../../utils/api";

const initialState = {
  user: null,
  loading: false,
  error: null,
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
      // Must use withCredentials to send cookies (refresh token) in cross-origin production requests
      const response = await axiosPublic.post('/api/v1/user/refresh-access-token', {}, { withCredentials: true })
      return response.data
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server'
      console.log(message)
      return rejectWithValue(message) 
    }
  }
)

// FIX: Corrected the axios call
export const fetchCurrentUser = createAsyncThunk(
  "user/current-user",
  async(_, {rejectWithValue}) => {
    try {
      const response = await axiosPrivate.get('/api/v1/user/current-user')
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
      const response = await axiosPublic.post('/api/v1/user/login',userData, {withCredentials : true}) 
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

// FIX: Simplified and corrected initializeAuth
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Always try to fetch current user first
      const currentUserResponse = await dispatch(fetchCurrentUser()).unwrap();
      return currentUserResponse;
    } catch (error) {
      console.log("Fetching current user failed, attempting to refresh token...");
      try {
        // If current user fails, try refreshing the token
        const refreshTokenResponse = await dispatch(refreshAccessToken()).unwrap();
        return refreshTokenResponse;
      } catch (refreshError) {
        console.log("Token refresh failed. User is not authenticated.", refreshError);
        return rejectWithValue(refreshError);
      }
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    resetAuthState: (state) => {
      return {
        ...initialState,
        authChecked: true
      }
    },
    clearTransition: (state) => {
      state.isTransitioning = false;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data; 
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
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
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.loading = false;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })

      .addCase(registerBasicUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isTransitioning = true;
      })
      .addCase(registerBasicUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.data;
        state.isTransitioning = false;
      })
      .addCase(registerBasicUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isTransitioning = false;
      })

      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload && action.payload.data) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.authChecked = true;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.loading = false;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { currentUser } = action.payload.data;
        if (currentUser) {
          state.user = currentUser;
        }
      })
      .addCase(unFollowUser.fulfilled, (state, action) => {
        const { currentUser } = action.payload.data;
        if (currentUser) {
          state.user = currentUser;
        }
      })
      .addCase(approveFollowRequest.fulfilled, (state, action) => {
        const { currentUser } = action.payload.data;
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
      .addCase(makeProfilePrivateOrPublic.fulfilled, (state, action) => {
        if (action.payload && action.payload.data) {
          state.user = action.payload.data?.currentUser
        }
      })
  }
})

export const { resetAuthState, clearTransition } = authSlice.actions

export default authSlice.reducer;