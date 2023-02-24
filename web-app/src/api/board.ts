import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const boardsApi = createApi({
  reducerPath: "boardsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/boards" }),
  tagTypes: ["Boards"],
  endpoints: (builder) => ({
    fetchBoards: builder.query<string[], void>({
      query: () => ({
        method: "GET",
        url: "",
      }),
    }),
  }),
});

export const { useFetchBoardsQuery } = boardsApi;
