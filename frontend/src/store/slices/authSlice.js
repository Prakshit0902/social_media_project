import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,
  loading : false,
  error : null,
  isAuthenticated: false,
  authChecked: false,
}

export const refreshAccessToken = createAsyncThunk(
  "user/refresh-access-token",
  async (_,{rejectWithValue}) => {
    try {
      const response = await axios.post('/api/v1/user/refresh-access-token',{withCredentials : true})
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
      const response = await axios.get('/api/v1/user/current-user', {withCredentials : true})
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
      const response = await axios.post("/api/v1/user/register", userData);
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
  async (userData, {rejectedWithValue}) => {
    try {
      const response = await axios.post('api/v1/user/login',userData, {withCredentials : true}) 
      return {
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      }
    } catch (error) {
        const message = error.response?.data?.message || error?.messsage || 'Unknown error occured during login' 
        return rejectedWithValue(message)     
    }
  }
)

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_,{rejectedWithValue}) => {
    try {
        const response = await axios.post('/api/v1/user/logout', {} , {withCredentials : true})
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error?.messsage || 'Unknown error occured during login' 
        return rejectedWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name : 'auth',
  initialState : initialState,
  reducers : {},

  extraReducers : (builder) => {
    builder
    .addCase(signupUser.pending , (state) => {
      state.loading = true
      state.error = null
    })

    .addCase(signupUser.fulfilled, (state,action) => {
      console.log(action)
      
      state.loading = false
      state.user = action.payload
    })

    .addCase(signupUser.rejected ,(state,action) => {
      state.loading = false
      state.error = action.payload
    })

    .addCase(loginUser.pending, (state) => {
      state.loading = true
      state.error = null
    })

    .addCase(loginUser.fulfilled,(state,action) => {
      state.loading = false
      // console.log(action.payload)
      
      state.user = action.payload
    })

    .addCase(loginUser.rejected, (state,action) => {
      state.loading = false
      state.error = action.payload
    })

    .addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authChecked = true; 
      state.loading = false;
    })
    .addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;   
      state.loading = false;
    })
    
    .addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Clear any other user-related state
    })
  }
}
)


export default authSlice.reducer;
