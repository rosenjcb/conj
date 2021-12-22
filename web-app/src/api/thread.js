import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';
export const updateThread = (post, id) => axios.put(`/threads/${id}`, post);

export const createThread = (post) => axios.post('/threads', post);

export const fetchThreads = () => axios.get('/threads');

export const upsertThread = (post, path) => {
  const slugs  = path.split('/');
  const id = slugs[2];
  return slugs.length === 3 ? axios.put(`/threads/${id}`, post) : axios.post('/threads', post);
}

