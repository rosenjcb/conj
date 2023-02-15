import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateThread {
  board: string;
  post: string;
}

export interface UpdateThread {
  board: string;
  threadNo: string;
  post: string;
}

export interface Post {}

export const threadApi = createApi({
  reducerPath: "threadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/boards" }),
  tagTypes: ["Thread", "Threads"],
  endpoints: (builder) => ({
    createThread: builder.mutation<any, CreateThread>({
      query: ({ board, post }) => ({
        method: "POST",
        url: `/${board}`,
        body: post,
      }),
      invalidatesTags: ["Threads"],
    }),
    updateThread: builder.mutation<any, UpdateThread>({
      query: ({ board, threadNo, post }) => ({
        method: "PUT",
        url: `/${board}/threads/${threadNo}`,
        body: post,
      }),
      invalidatesTags: ["Thread"],
    }),
    fetchThread: builder.query<Post[], any>({
      query: ({ board, threadNo }) => ({
        method: "GET",
        url: `/${board}/threads/${threadNo}`,
      }),
      providesTags: ["Thread"],
    }),
    fetchThreads: builder.query<any, any>({
      query: (board) => ({
        method: "GET",
        url: `/${board}`,
      }),
      providesTags: ["Threads"],
    }),
    deleteThread: builder.mutation<any, any>({
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
