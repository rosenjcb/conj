import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const threadApi = createApi({
  reducerPath: "threadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/boards" }),
  tagTypes: ["Thread", "Threads"],
  endpoints: (builder) => ({
    createThread: builder.mutation({
      query: ({ board, post }) => ({
        method: "POST",
        url: `/${board}`,
        body: post,
      }),
      invalidatesTags: ["Threads"],
    }),
    updateThread: builder.mutation({
      query: ({ board, threadNo, post }) => ({
        method: "PUT",
        url: `/${board}/threads/${threadNo}`,
        body: post,
      }),
      invalidatesTags: ["Thread"],
    }),
    fetchThread: builder.query({
      query: ({ board, threadNo }) => ({
        method: "GET",
        url: `/${board}/threads/${threadNo}`,
      }),
      providesTags: ["Thread"],
    }),
    fetchThreads: builder.query({
      query: (board) => ({
        method: "GET",
        url: `/${board}`,
      }),
      providesTags: ["Threads"],
    }),
  }),
});

export const {
  useCreateThreadMutation,
  useUpdateThreadMutation,
  useFetchThreadQuery,
  useFetchThreadsQuery,
} = threadApi;
