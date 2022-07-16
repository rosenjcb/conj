import axios from 'axios';

export const updateThread = (board, threadNo, post) => axios.put(`/api/boards/${board}/threads/${threadNo}`, post, { headers: {"Content-Type": "multipart/form-data"}});

export const createThread = (board, post) => axios.post(`/api/boards/${board}`, post, { headers: {"Content-Type": "multipart/form-data"}});

export const fetchThreads = (board) => axios.get(`/api/boards/${board}`);

export const fetchThread = (board, threadNo) => axios.get(`/api/boards/${board}/threads/${threadNo}`);

export const upsertThread = async(board, threadNo, post) => {
  var formData = new FormData();
  for (let [key, val] of Object.entries(post)) {
    if(val !== null) formData.append(key, val);
  }

  return threadNo !== null
    ? updateThread(board, threadNo, formData)
    : createThread(board, formData);
}

