// import { createSlice } from "@reduxjs/toolkit";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,
  loading : false,
  error : null,
  isAuthenticated: false,
}

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
        console.log(message)
        return rejectedWithValue(message)     
    }
  }
)

const userSlice = createSlice({
  name : 'user',
  initialState : initialState,
  reducers : {},

  extraReducers : (builder) => {
    builder
    .addCase(signupUser.pending , (state) => {
      state.loading = true,
      state.error = null
    })

    .addCase(signupUser.fulfilled, (state,action) => {
      state.loading = false,
      state.user = action.payload
    })

    .addCase(signupUser.rejected ,(state,action) => {
      state.loading = false,
      state.error = action.payload
    })
  }
}
)


export default userSlice.reducer;
