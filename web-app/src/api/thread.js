import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';
export const updateThread = (board, threadId, post) => axios.put(`/api/boards/${board}/threads/${threadId}`, post, {headers: {"Content-Type": "multipart/form-data"}});

export const createThread = (board, post) => axios.post(`/api/boards/${board}`, post, {headers: {"Content-Type": "multipart/form-data"}});

export const fetchThreads = (board) => axios.get(`/api/boards/${board}`);

export const upsertThread = (board, opNo, post) => {
  var formData = new FormData();
  for (let [key, val] of Object.entries(post)) {
    // append each item to the formData (converted to JSON strings)
    if(val !== null) formData.append(key, val);
  }

  return opNo 
    ? updateThread(board, opNo, post)
    : createThread(board, post);
}

