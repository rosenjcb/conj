import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subject: "",
  comment: "",
  image: null, 
  hidden: true,
  threadNo: null,
  is_anonymous: false
}

export const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    insertPostLink: (state, action) => {
      return {...state, comment: `${state.comment} #${action.payload}`}
    },
    updateEntry: (state, action) => {
      const { key, value } = action.payload;
      return {...state, [key]: value};
    },
    resetPost: (state) => {
      return {...state, ...initialState};
    },
    toggleQuickReply: (state, action) => {
      return {...state, hidden: action.payload};
    },
    openQuickReply: (state, action) => {
      return {...state, threadNo: action.payload, hidden: false};
    },
    closeQuickReply: (state) => {
      return {...state, hidden: true}
    }
  }
});

export const { insertPostLink, updateEntry, resetPost, openQuickReply, closeQuickReply } = postSlice.actions

export default postSlice.reducer
