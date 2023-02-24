import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import _ from "lodash";
import { Account } from "../types";

const fetchBaseQueryDefault = (queryOptions: any) => {
  const baseQuery = fetchBaseQuery(queryOptions);
  return async (args: any, api: any, extraOptions: any) => {
    const result = await baseQuery(args, api, extraOptions);
    const isMeQuery = args.url === "me" && args.method === "GET";
    if (result.error && isMeQuery) {
      const final = { ...result, data: null };
      return _.omit(final, "error");
    }
    return result;
  };
};

export const meApi = createApi({
  reducerPath: "meApi",
  baseQuery: fetchBaseQueryDefault({ baseUrl: "/api/" }),
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    me: builder.query<Account, void>({
      query: () => ({
        method: "GET",
        url: "me",
      }),
      providesTags: ["Me"],
    }),
    logout: builder.mutation({
      query: () => ({
        method: "GET",
        url: "logout",
      }),
      invalidatesTags: ["Me"],
    }),
    login: builder.mutation({
      query: (body) => ({
        method: "POST",
        body: body,
        url: "authenticate",
      }),
      invalidatesTags: ["Me"],
    }),
    signup: builder.mutation({
      query: (body) => ({
        method: "POST",
        body: body,
        url: "accounts",
      }),
    }),
    updateMe: builder.mutation({
      query: (body) => ({
        method: "PUT",
        body: body,
        url: "me",
      }),
      invalidatesTags: ["Me"],
    }),
    finishOnboarding: builder.mutation({
      query: (body) => ({
        method: "POST",
        body: body,
        url: "onboarding",
      }),
      invalidatesTags: ["Me"],
    }),
  }),
});

export const {
  useMeQuery,
  useLogoutMutation,
  useLoginMutation,
  useSignupMutation,
  useUpdateMeMutation,
  useFinishOnboardingMutation,
} = meApi;
