import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Thread } from "../types";

export interface FetchThreads {
  board: string;
}

export interface FetchThread {
  board: string;
  threadNo: string;
}

export interface DeleteThread {
  board: string;
  threadNo: string;
  params: {
    ban?: boolean;
    postNo?: string;
  };
}

export interface CreateThread {
  board: string;
  post: FormData;
}

export interface UpdateThread {
  board: string;
  threadNo: string;
  post: FormData;
}

export const threadApi = createApi({
  reducerPath: "threadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/boards" }),
  tagTypes: ["Thread", "Threads"],
  endpoints: (builder) => ({
    createThread: builder.mutation<Thread, CreateThread>({
      query: ({ board, post }) => ({
        method: "POST",
        url: `/${board}`,
        body: post,
      }),
      invalidatesTags: ["Threads"],
    }),
    updateThread: builder.mutation<Thread, UpdateThread>({
      query: ({ board, threadNo, post }) => ({
        method: "PUT",
        url: `/${board}/threads/${threadNo}`,
        body: post,
      }),
      invalidatesTags: ["Thread"],
    }),
    fetchThread: builder.query<Thread, any>({
      query: ({ board, threadNo }) => ({
        method: "GET",
        url: `/${board}/threads/${threadNo}`,
      }),
      providesTags: ["Thread"],
    }),
    fetchThreads: builder.query<Thread[], string>({
      query: (board) => ({
        method: "GET",
        url: `/${board}`,
      }),
      providesTags: ["Threads"],
    }),
    deleteThread: builder.mutation<string, DeleteThread>({
      query: ({ board, threadNo, params }) => ({
        method: "DELETE",
        url: `/${board}/threads/${threadNo}`,
        params: params,
        responseHandler: (resp) => resp.text(),
      }),
      invalidatesTags: ["Threads", "Thread"],
    }),
  }),
});

export const {
  useCreateThreadMutation,
  useUpdateThreadMutation,
  useFetchThreadQuery,
  useFetchThreadsQuery,
  useDeleteThreadMutation,
} = threadApi;
