import axios from 'axios';
import { retry, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import toast from 'react-hot-toast';

// export const login = (accountDetails) => {
//   return axios.post('/api/authenticate', accountDetails);
// };

export const logout = () => {
  return axios.get('/api/logout');
};

export const signup = (accountDetails) => {
  return axios.post('/api/accounts', accountDetails);
};

export const updateMe = (me) => {
  var formData = new FormData();
  for (let [key, val] of Object.entries(me)) {
    if(val !== null) formData.append(key, val);
  }
  return axios.put('/api/me', formData);
}

const fetchBaseQueryDefault = (queryOptions) => {
  const baseQuery = fetchBaseQuery(queryOptions);
  return async(args, api, extraOptions) => {
    console.log(args);
    const result = await baseQuery(args, api, extraOptions);
    const isMeQuery = args.url === "me" && args.method === "GET";
    if(result.error && isMeQuery) {
      //toast.error('Whoops :)');
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
    })
  })
})

export const { useMeQuery, useLogoutMutation, useLoginMutation } = meApi;

