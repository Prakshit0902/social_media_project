import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    explorePosts: [],
    feedPosts: [],
    exploreLoading: false,
    feedLoading: false,
    error: null,
    explorePage: 1,
    feedPage: 1,
    hasMoreExplore: true,
    hasMoreFeed: true,
};

export const getUserPostFeed = createAsyncThunk(
    'user/get-post-feed',
    async (page, { rejectWithValue }) => {
        const host = window.location.hostname;
        const backendPort = 3000; // Your backend port
        const baseURL = host === 'localhost' 
        ? `http://localhost:${backendPort}`
        : `http://${host}:${backendPort}`
        try {
            const response = await axios.get(`${baseURL}/api/v1/user/post-feed?page=${page}&limit=10`, { withCredentials: true });
            return { data: response.data.data, page };
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server';
            console.log(message);
            return rejectWithValue(message);
        }
    }
);

export const getUserExploreFeed = createAsyncThunk(
    'user/explore',
    async (page, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/v1/user/explore?page=${page}&limit=20`, { withCredentials: true });
            return { data: response.data.data, page };
        } catch (error) {
            const message = error?.message || error?.response?.data?.message || 'Unknown error occurred on server';
            console.log(message);
            return rejectWithValue(message);
        }
    }
);

const feedSlice = createSlice({
    name: 'feed',
    initialState: initialState,
    reducers: {
        resetExplorePage: (state) => {
            state.explorePage = 1;
            state.explorePosts = [];
            state.hasMoreExplore = true;
        },
        resetFeedPage: (state) => {
            state.feedPage = 1;
            state.feedPosts = [];
            state.hasMoreFeed = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserPostFeed.pending, (state) => {
                state.feedLoading = true;
                state.error = null;
            })
            .addCase(getUserPostFeed.fulfilled, (state, action) => {
                state.feedLoading = false;
                state.error = null;
                if (action.payload.page === 1) {
                    state.feedPosts = action.payload.data;
                } else {
                    state.feedPosts = [...state.feedPosts, ...action.payload.data];
                }
                state.feedPage = action.payload.page;
                state.hasMoreFeed = action.payload.data.length === 10; // Assuming limit=10
            })
            .addCase(getUserPostFeed.rejected, (state, action) => {
                state.feedLoading = false;
                state.error = action.payload;
            })
            .addCase(getUserExploreFeed.pending, (state) => {
                state.exploreLoading = true;
                state.error = null;
            })
            .addCase(getUserExploreFeed.fulfilled, (state, action) => {
                state.exploreLoading = false;
                state.error = null;
                if (action.payload.page === 1) {
                    state.explorePosts = action.payload.data;
                } else {
                    state.explorePosts = [...state.explorePosts, ...action.payload.data];
                }
                state.explorePage = action.payload.page;
                state.hasMoreExplore = action.payload.data.length === 20; // Assuming limit=20
            })
            .addCase(getUserExploreFeed.rejected, (state, action) => {
                state.exploreLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetExplorePage, resetFeedPage } = feedSlice.actions;
export default feedSlice.reducer;