import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';
export const updateThread = (post, id) => axios.put(`/threads/${id}`, post);

export const createThread = (post) => axios.post('/threads', post);

export const fetchThreads = () => axios.get('/threads');

export const upsertThread = (post, opNo) => {
  return opNo ? axios.put(`/threads/${opNo}`, post) : axios.post('/threads', post);
}

