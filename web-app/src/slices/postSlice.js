import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  content: ""
}

export const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    insertPostLink: (state, action) => {
      return {...state, content: state.content + ">>" + action.payload + "\n"}
    },
    updateText: (state, action) => {
      state.content = action.payload; 
    },
    resetComment: (state) => {
      state.content = "";
    }
  }
});

export const { insertPostLink, updateText, resetComment } = postSlice.actions

export default postSlice.reducer
