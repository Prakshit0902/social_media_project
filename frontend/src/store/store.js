import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice.js'
import userReducer from './slices/userSlice.js'
import feedReducer from './slices/feedSlice.js'
import postReducer from './slices/postSlice.js'



export const store = configureStore({
  reducer: {
    auth: authReducer,
    user : userReducer,
    feed : feedReducer,
    post : postReducer
    // Add more reducers as needed
  },
});