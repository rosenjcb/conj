import { configureStore } from "@reduxjs/toolkit";
import postReducer from "./slices/postSlice";
import { meApi } from "./api/account";
import { boardsApi } from "./api/board";
import { threadApi } from "./api/thread";
import { setupListeners } from "@reduxjs/toolkit/dist/query";

export const store = configureStore({
  reducer: {
    [meApi.reducerPath]: meApi.reducer,
    [boardsApi.reducerPath]: boardsApi.reducer,
    [threadApi.reducerPath]: threadApi.reducer,
    post: postReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(meApi.middleware)
      .concat(boardsApi.middleware)
      .concat(threadApi.middleware),
});

setupListeners(store.dispatch);
