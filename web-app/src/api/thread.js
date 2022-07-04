import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';
export const updateThread = (post, id) => axios.put(`/threads/${id}`, post);

export const createThread = (post) => axios.post('/threads', post);

export const fetchThreads = () => axios.get('/threads');

export const upsertThread = (post, opNo) => {
  var formData = new FormData();
  for (let [key, val] of Object.entries(post)) {
    // append each item to the formData (converted to JSON strings)
    if(val !== null) formData.append(key, val);
  }

  return opNo ? axios.put(`/threads/${opNo}`, formData, {headers: {"Content-Type": "multipart/form-data"}}) : axios.post('/threads', formData, {headers: {"Content-Type": "multipart/form-data"}});
}

