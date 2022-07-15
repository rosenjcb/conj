import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';
export const me = () => axios.get('/api/me');

export const login = (accountDetails) => {
  return axios.post('/api/authenticate', accountDetails);
};

export const logout = () => {
  return axios.get('/api/logout');
}

export const signup = (accountDetails) => {
  return axios.post('/api/accounts', accountDetails);
};
