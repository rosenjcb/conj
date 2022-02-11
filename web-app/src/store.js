import { configureStore } from '@reduxjs/toolkit'
import threadReducer from './slices/threadSlice';

export const store = configureStore({
  reducer: {
    thread: threadReducer
  }
});
