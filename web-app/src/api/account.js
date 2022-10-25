import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const fetchBaseQueryDefault = (queryOptions) => {
  const baseQuery = fetchBaseQuery(queryOptions);
  return async(args, api, extraOptions) => {
    console.log(args);
    const result = await baseQuery(args, api, extraOptions);
    const isMeQuery = args.url === "me" && args.method === "GET";
    if(result.error && isMeQuery) {
      delete result.error;
      return {...result, data: null};
    } else {
      return result;
    }
  }
}

export const meApi = createApi({
  reducerPath: 'meApi',
  baseQuery: fetchBaseQueryDefault({baseUrl:'/api/'}),
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    me: builder.query({
      query: () => ({
        method: 'GET',
        url: 'me'
      }),
      providesTags: ['Me']
    }),
    logout: builder.mutation({
      query: () => ({
        method: 'GET',
        url: 'logout'
      }),
      invalidatesTags: ['Me']
    }),
    login: builder.mutation({
      query: (body) => ({
        method: 'POST',
        body: body,
        url: 'authenticate'
      }),
      invalidatesTags: ['Me']
    }),
    signup: builder.mutation({
      query: (body) => ({
        method: 'POST',
        body: body,
        url: 'accounts'
      })
    }),
    updateMe: builder.mutation({
      query: (body) => ({
        method: 'PUT',
        body: body,
        url: 'me'
      })
    })
  })
})

export const { useMeQuery, useLogoutMutation, useLoginMutation, useSignupMutation, useUpdateMeMutation } = meApi;
