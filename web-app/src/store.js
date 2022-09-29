import { configureStore } from '@reduxjs/toolkit'
import threadReducer from './slices/threadSlice';
import postReducer from './slices/postSlice';
import { meApi } from './api/account';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

export const store = configureStore({
  reducer: {
    [meApi.reducerPath]: meApi.reducer,
    thread: threadReducer,
    post: postReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}).concat(meApi.middleware)
});

setupListeners(store.dispatch);