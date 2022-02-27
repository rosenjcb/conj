import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';
export const me = () => axios.get('/me');

export const login = (accountDetails) => {
  return axios.post('/authenticate', accountDetails);
};

export const logout = () => {
  return axios.get('/logout');
}

export const signup = (accountDetails) => {
  return axios.post('/accounts', accountDetails);
};
