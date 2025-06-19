import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import feedReducer from './slices/feedSlice.js';
import postReducer from './slices/postSlice.js';

// Configuration for redux-persist
const persistConfig = {
    key: 'root', // Key for the persisted state in storage
    storage, // Storage engine (localStorage by default)
    // Optionally, specify which reducers to persist if you don't want all state persisted
    // whitelist: ['post', 'auth'], // Only persist these reducers
    blacklist: ['feed','user'], // Exclude these reducers from persisting
};

// Combine all reducers into a root reducer
const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    feed: feedReducer,
    post: postReducer,
});

// Wrap the root reducer with persistReducer to enable persistence
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
    reducer: persistedReducer,
    // Optional: Add middleware or other configurations if needed
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore non-serializable values for redux-persist actions
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});


export const persistor = persistStore(store);