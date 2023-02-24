import { configureStore } from "@reduxjs/toolkit";
import postReducer from "./slices/postSlice";
import { meApi } from "./api/account";
import { boardsApi } from "./api/board";
import { threadApi } from "./api/thread";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

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

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
