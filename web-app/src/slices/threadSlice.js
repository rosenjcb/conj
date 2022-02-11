import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: [] 
}

export const threadSlice = createSlice({
  name: 'thread',
  initialState,
  reducers: {
    swapThread: (state, action) => {
      state.current = action.payload
    }
  }
});

export const { addPost, swapThread } = threadSlice.actions

export default threadSlice.reducer
