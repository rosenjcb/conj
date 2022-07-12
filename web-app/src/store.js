import { configureStore } from '@reduxjs/toolkit'
import threadReducer from './slices/threadSlice';
import postReducer from './slices/postSlice';

export const store = configureStore({
  reducer: {
    thread: threadReducer,
    post: postReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})
});
