import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios from 'axios';
import * as _ from 'lodash';

// export const updateThread = (board, threadNo, post) => axios.put(`/api/boards/${board}/threads/${threadNo}`, post, { headers: {"Content-Type": "multipart/form-data"}});

// export const createThread = (board, post) => axios.post(`/api/boards/${board}`, post, { headers: {"Content-Type": "multipart/form-data"}});

// export const fetchThreads = (board) => axios.get(`/api/boards/${board}`);

// export const fetchThread = (board, threadNo) => axios.get(`/api/boards/${board}/threads/${threadNo}`);

// export const upsertThread = async(board, threadNo, post) => {
//   const req = _.pick(post, 'name', 'image', 'subject', 'comment', 'is_anonymous')
//   var formData = new FormData();
//   for (let [key, val] of Object.entries(req)) {
//     if(val !== null) formData.append(key, val);
//   }

//   return threadNo !== null
//     ? updateThread(board, threadNo, formData)
//     : createThread(board, formData);
// }

export const threadApi = createApi({
  reducerPath: 'threadApi',
  baseQuery: fetchBaseQuery({baseUrl: '/api/boards'}),
  tagTypes: ['Thread'],
  endpoints: (builder) => ({
    createThread: builder.mutation({
      query: ({board, post}) => ({
        method: 'POST',
        url: `/${board}`,
        body: post
      }),
      invalidatesTags: ['Threads']
    }),
    updateThread: builder.mutation({
      query: ({board, threadNo, post}) => ({
        method: 'PUT',
        url: `/${board}/threads/${threadNo}`,
        body: post
      }),
      invalidatesTags: ['Thread']
    }),
    fetchThread: builder.query({
      query: ({board, threadNo}) => ({
        method: 'GET',
        url: `/${board}/threads/${threadNo}`
      }),
      providesTags: ['Thread']
    }),
    fetchThreads: builder.query({
      query: (board) => ({
        method: 'GET',
        url: `/${board}`
      }),
      providesTags: ['Threads']
    })
  })
});

export const { useCreateThreadMutation, useUpdateThreadMutation, useFetchThreadQuery, useFetchThreadsQuery } = threadApi;

